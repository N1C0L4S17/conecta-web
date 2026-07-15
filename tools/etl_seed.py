"""
ETL CONECTA URP 2025
--------------------
Lee la hoja `Form_Responses3` del Excel oficial, normaliza los campos
analiticos (excluye PII segun Ley 29733) y genera:

  backend/prisma/seed-data.json

Ejecutar:  python tools/etl_seed.py <ruta_excel>
"""
import json, sys, math
import pandas as pd

SRC = sys.argv[1] if len(sys.argv) > 1 else \
    "/mnt/user-data/uploads/DATA_CONECTA_URP_2025_ESTANDARIZADO.xlsx"
OUT = "backend/prisma/seed-data.json"

# --- Mapa de columnas crudas -> nombre analitico ---
COL = {
    "campania":      "Encuesta",
    "anioEgreso":    "AñoEgresoOficial",
    "anioTitulacion":"AñoTitulación",
    "escuela":       "Facultad/Escuela",
    "grado":         "Gradoacadémico",
    "negocio":       "¿Cuentaconunnegociopropio?",
    "trabajando":    "¿Actualmenteseencuentratrabajando?",
    "tipoEmpleo":    "Tipo_Empleo_Estandarizado",
    "tipoEmpresa":   "Tipodeempresaenlaquetrabaja:",
    "rubro":         "RUBRO",
    "cargoNivel":    "Cargo_Estandarizado",
    "cargoTexto":    "¿Quécargodesempeña?",
    "correspondencia":"¿SupuestoactualestárelacionadoconlacarreraqueestudióenURP?",
    "satisfaccion":  "¿Estásatisfecho(a)consudesarrollolaboral?",
    "tiempoEmpleo":  "¿Cuántotiempotardóenencontrarsuprimerempleodespuésdeegresar?",
    "calidadFormacion":"¿CómocalificalacalidaddelaformaciónrecibidaenlaURP?",
    "ubicacion":     "PaísyCiudadderesidenciaactual2",
}

# Enums canonicos (coinciden con schema.prisma)
CORRESPONDENCIA = {"Totalmente": "TOTALMENTE", "Mucho": "MUCHO",
                   "Poco": "POCO", "Nada": "NADA"}
TIEMPO = {
    "Menos de 3 meses": "MENOS_3M",
    "Entre 3 meses y 6 meses": "ENTRE_3_6M",
    "Entre 6 meses y 1 año": "ENTRE_6_12M",
    "Entre 1 año y 2 años": "ENTRE_1_2A",
    "Más de 2 años": "MAS_2A",
}
TIPO_EMPLEO = {"Privada": "PRIVADA", "Pública": "PUBLICA"}


def clean(v):
    if v is None: return None
    if isinstance(v, float) and math.isnan(v): return None
    s = str(v).strip()
    return s if s and s.lower() != "nan" else None


def to_int(v):
    v = clean(v)
    if v is None: return None
    try: return int(float(v))
    except ValueError: return None


def anio_valido(v, tope=2025):
    """Año plausible de egreso/titulación: entre 1961 (fundación URP) y la campaña."""
    n = to_int(v)
    if n is None: return None
    return n if 1961 <= n <= tope else None


def facultad_de(escuela: str) -> str:
    """Deriva la Facultad a partir de la etiqueta combinada Facultad/Escuela."""
    e = escuela.lower()
    if e.startswith("ccee"): return "Ciencias Económicas y Empresariales"
    if "ingeniería" in e or "ingenieria" in e: return "Ingeniería"
    if "arquitectura" in e: return "Arquitectura y Urbanismo"
    if "psicología" in e: return "Psicología"
    if "derecho" in e: return "Derecho y Ciencia Política"
    if "medicina" in e: return "Medicina Humana"
    if "biológic" in e or "biologic" in e or "veterinaria" in e:
        return "Ciencias Biológicas"
    if "lenguas" in e or "traducción" in e: return "Humanidades y Lenguas Modernas"
    return "Otras"


def main():
    df = pd.read_excel(SRC, sheet_name="Form_Responses3")
    df = df.rename(columns={v: k for k, v in COL.items()})

    escuelas, rubros, niveles = {}, {}, {}
    respuestas = []

    def reg(store, nombre):
        if nombre is None: return None
        if nombre not in store:
            store[nombre] = len(store) + 1
        return store[nombre]

    for _, r in df.iterrows():
        escuela = clean(r.get("escuela"))
        rubro = clean(r.get("rubro"))
        nivel = clean(r.get("cargoNivel"))
        trabajando = clean(r.get("trabajando")) == "Sí"

        # tipo de empleo estandarizado; fallback a tipo de empresa
        te = clean(r.get("tipoEmpleo")) or clean(r.get("tipoEmpresa"))
        temp = clean(r.get("tipoEmpresa"))
        corr = clean(r.get("correspondencia"))
        tie = clean(r.get("tiempoEmpleo"))

        respuestas.append({
            "campania": to_int(r.get("campania")) or 2025,
            "anioEgreso": anio_valido(r.get("anioEgreso")),
            "anioTitulacion": anio_valido(r.get("anioTitulacion")),
            "escuelaId": reg(escuelas, escuela),
            "grado": clean(r.get("grado")),
            "trabajando": trabajando,
            "tieneNegocio": clean(r.get("negocio")) == "Sí",
            "tipoEmpleo": TIPO_EMPLEO.get(te),
            "tipoEmpresa": TIPO_EMPLEO.get(temp),
            "rubroId": reg(rubros, rubro) if trabajando else None,
            "nivelCargoId": reg(niveles, nivel) if trabajando else None,
            "cargoTexto": clean(r.get("cargoTexto")),
            "correspondencia": CORRESPONDENCIA.get(corr),
            "satisfaccion": to_int(r.get("satisfaccion")),
            "tiempoPrimerEmpleo": TIEMPO.get(tie),
            "calidadFormacion": to_int(r.get("calidadFormacion")),
            "ubicacion": clean(r.get("ubicacion")),
        })

    out = {
        "campanias": [{"anio": 2025, "nombre": "CONECTA URP 2025", "activa": True}],
        "escuelas": [{"id": i, "nombre": n, "facultad": facultad_de(n)}
                     for n, i in escuelas.items()],
        "rubros": [{"id": i, "nombre": n} for n, i in rubros.items()],
        "nivelesCargo": [{"id": i, "nombre": n} for n, i in niveles.items()],
        "respuestas": respuestas,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    print(f"OK -> {OUT}")
    print(f"  respuestas   : {len(respuestas)}")
    print(f"  escuelas     : {len(escuelas)}")
    print(f"  rubros       : {len(rubros)}")
    print(f"  niveles cargo: {len(niveles)}")


if __name__ == "__main__":
    main()
