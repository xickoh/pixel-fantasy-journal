#!/usr/bin/env python3
"""Builds data/wiki_data.js, the wiki's numbers, from the game's own data.

  python3 tools/build_wiki.py            runs the Godot exporter (tools/export_wiki.gd) and builds the file
  python3 tools/build_wiki.py --json F   builds it from an exporter's JSON already made (no Godot)
  python3 tools/build_wiki.py --check    builds nothing: says whether data/wiki_data.js is out of date with the
                                         game (exit 1 if it is), to run after a change to the game

The items, the recipes, the enemies' stats, the shops and their prices, the villagers' lines, the quests,
the blessings and the player's constants all come from the game's .tres files (the exporter reads them
through the game's classes, so a stat that is worked out in code is the game's own). The names and texts
are the game's pt translations (translations/strings.csv). What is not in the data, the mechanics, is
written by hand in data/wiki_mechanics.js, with {s.key} marks for the numbers that are in the data.
"""
import csv, json, subprocess, sys, datetime, pathlib, os, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAME = pathlib.Path(os.environ.get("PF_GAME", "/home/deck/Documents/pixel_fantasy"))
TMP = ROOT / ".wiki_tmp"

CATEGORIES = {
    "weapon": "Armas", "tool": "Ferramentas", "equipment": "Equipamento", "food": "Comida", "potion": "Poções",
    "magic": "Magia", "mount": "Montadas", "placeable": "Colocáveis", "material": "Materiais", "ammo": "Munição",
    "loot": "Saque", "blueprint": "Plantas", "weapon_power": "Poderes de arma",
}
SLOTS = {"head": "Cabeça", "chest": "Peito", "legs": "Pernas", "off_hand": "Mão secundária", "mount": "Montada"}
WEAPON_TYPES = {0: "Corpo a corpo", 1: "À distância", 2: "Mágica"}
FAMILIES = {"orc": "Orcs", "skeleton": "Esqueletos", "mummy": "Múmias"}
BIOMES = {"forest": "Floresta", "desert": "Deserto"}
STATIONS = {"": "À mão", "crafting_table": "Bancada de Trabalho", "furnace": "Fornalha"}


def load_translations():
    path = GAME / "translations" / "strings.csv"
    t = {}
    if path.exists():
        for r in csv.reader(open(path, encoding="utf-8"), delimiter=";"):
            if len(r) > 1 and r[1]:
                t[r[0]] = r[1]
    return t


def run_exporter():
    TMP.mkdir(exist_ok=True)
    out = TMP / "wiki.json"
    if out.exists():
        out.unlink()
    cmd = ["flatpak", "run", "org.godotengine.Godot", "--headless", "--path", str(GAME),
           str(ROOT / "tools" / "export_wiki.tscn"), "--", str(out)]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if not out.exists():
        sys.exit("the exporter made no file:\n" + (r.stdout + r.stderr)[-2000:])
    return out


def num(x):
    return int(x) if isinstance(x, (int, float)) and float(x) == int(x) else round(x, 2)


def main():
    if "--json" in sys.argv:
        src = pathlib.Path(sys.argv[sys.argv.index("--json") + 1])
    else:
        src = run_exporter()
    raw = json.load(open(src, encoding="utf-8"))
    T = load_translations()

    def tr(s):
        return T.get(s, s) if s else s

    items_by_id = {i["id"]: i for i in raw["items"]}

    def iname(i):
        it = items_by_id.get(i)
        return tr(it["name"]) if it else i

    # --- who drops what
    drops = {}
    for e in raw["enemies"]:
        for line in e.get("loot_table", []):
            for iid in line["items"]:
                drops.setdefault(iid, []).append({"enemy": tr(e["name"]), "chance": line["chance"],
                                                  "min": line["min"], "max": line["max"], "boss": e["boss"]})

    # --- who sells what
    sold = {}
    for s in raw["stores"]:
        for it in s["items"]:
            sold.setdefault(it["id"], []).append({"shop": tr(s["name"]), "price": it["price"]})
        for o in s["offers"]:
            sold.setdefault(o["item"], []).append({"shop": tr(s["name"]), "price": o["price"], "amount": o.get("amount", 1)})

    recipes = {}
    for r in raw["recipes"]:
        recipes[r["result"]] = r
    for it in raw["items"]:
        tr_ = it.get("teaches_recipe")
        if tr_ and tr_.get("result") and tr_["result"] not in recipes:
            recipes[tr_["result"]] = {"result": tr_["result"], "amount": 1, "ingredients": tr_.get("ingredients", {}),
                                      "station": tr_.get("station", ""), "hidden": True}

    items = []
    for it in raw["items"]:
        sv = it.get("stat_values", {})
        stats = []

        def add(label, value):
            stats.append([label, value])

        if it["category"] == "weapon" or it["category"] == "tool":
            if "damage" in sv:
                add("Dano", num(sv["damage"][1]))
            if "weapon_type" in it or it["category"] == "weapon":
                add("Tipo", WEAPON_TYPES.get(it.get("weapon_type", 0), "Corpo a corpo"))
            if "reach" in sv:
                add("Alcance", "%s px" % num(sv["reach"][1]))
            if "shot_time" in sv:
                add("Tempo entre disparos", "%s s" % num(sv["shot_time"][1]))
            if "crit" in sv:
                add("Crítico", "%s%%" % num(sv["crit"][1]))
            if it.get("ammo_used"):
                add("Munição", iname(it["ammo_used"]))
            if it.get("mining_tier"):
                add("Nível de mineração", it["mining_tier"])
        if it["category"] == "equipment":
            if it.get("equip_slot"):
                add("Ranhura", SLOTS.get(it["equip_slot"], it["equip_slot"]))
            if "defense" in sv:
                add("Defesa", num(sv["defense"][1]))
            if "damage_taken" in sv:
                add("Dano sofrido", "-%s" % num(sv["damage_taken"][1]))
            if "max_health" in sv:
                add("Vida máxima", "+%s" % num(sv["max_health"][1]))
            if "ranged_bonus" in sv:
                add("Dano à distância", "+%s%%" % num(sv["ranged_bonus"][1]))
            if it.get("block_arc"):
                add("Bloqueia", "sim (botão direito)")
        if it.get("cure"):
            add("Cura", "+%s" % it["cure"])
        if it.get("teleports_home"):
            add("Efeito", "teletransporta para a vila" + (" (gasta-se)" if it.get("consumed_on_use", True) else " (não se gasta)"))
        if it.get("summons"):
            add("Invoca", tr(next((e["name"] for e in raw["enemies"] if e["id"] == it["summons"]), it["summons"])))
        if it.get("horse"):
            h = it["horse"]
            add("Velocidade a cavalo", "andar x%s · correr x%s" % (num(h.get("walk_factor", 0)), num(h.get("run_factor", 0))))
        if it.get("ally"):
            add("Invoca aliado", "sim")
        if it.get("light_radius"):
            add("Luz", "%s px" % num(it["light_radius"]))
        if it.get("placed_hits"):
            add("Parte-se com", "%s pancada(s)" % it["placed_hits"])
        if it.get("boss_only"):
            add("Origem", "só um chefe o larga")
        if it.get("enhanceable"):
            add("Melhorável", "sim")
        if it.get("factory_powers"):
            ps = []
            for k, v in it["factory_powers"].items():
                ps += v
            add("Poderes de fábrica", ", ".join(tr(next((p["display_name"] for p in raw["powers"] if p["id"] == x), x)) for x in ps))
        if it.get("teaches"):
            add("Ensina", iname(it["teaches"]))
        if it.get("stackable_number") and it["stackable_number"] > 1:
            add("Pilha", it["stackable_number"])
        row = {"id": it["id"], "name": tr(it["name"]), "name_en": it["name"], "cat": it["category"],
               "desc": tr(it.get("description", "")), "stats": stats}
        if it["id"] in recipes:
            r = recipes[it["id"]]
            row["recipe"] = {"amount": r["amount"], "station": STATIONS.get(r["station"], iname(r["station"])),
                             "hidden": r.get("hidden", False),
                             "ing": [[iname(k), v] for k, v in r["ingredients"].items()]}
        if it["id"] in sold:
            row["sold"] = sold[it["id"]]
        if it["id"] in drops:
            row["drops"] = drops[it["id"]]
        if it.get("sell_price"):
            row["sell"] = it["sell_price"]
        items.append(row)
    items.sort(key=lambda r: (list(CATEGORIES).index(r["cat"]) if r["cat"] in CATEGORIES else 99, r["name"]))

    # --- enemies
    enemies = []
    for e in raw["enemies"]:
        loot = []
        for line in e.get("loot_table", []):
            loot.append({"items": [iname(i) for i in line["items"]], "chance": line["chance"], "min": line["min"],
                         "max": line["max"], "weapon": line["weapon_drop"]})
        enemies.append({
            "id": e["id"], "name": tr(e["name"]), "family": FAMILIES.get(e.get("family", ""), e.get("family", "")),
            "biome": BIOMES.get(e.get("biome", "forest"), e.get("biome", "forest")), "boss": e["boss"],
            "archetype": e.get("archetype", ""), "ranged": bool(e.get("ranged")),
            "weapon": iname(e["weapon_id"]) if e.get("weapon_id") else "",
            "speed": e.get("speed", 45), "detection": e.get("detection_radius", 140), "windup": e.get("windup_time", 0.1),
            "knockback_reduction": e.get("knockback_reduction", 0), "crit": e.get("crit", 0),
            "weight": e.get("spawn_weight", 1), "shot_damage_l1": e.get("shot_damage_l1"),
            "levels": e["levels"], "loot": loot,
            "boss_health_x": (e.get("boss_rules") or {}).get("health_multiplier"),
        })
    enemies.sort(key=lambda r: (r["boss"], r["family"], r["levels"]["1"]["health"], r["name"]))

    # --- villagers: the roles come from the shops' data
    rules = raw["store_rules"]
    shop_items = lambda stock: [iname(i) for i in stock.get("items", [])] + [iname(o["item"]) for o in stock.get("offers", [])]
    villagers = [
        {"name": "Quem dá as missões", "where": "Junto à fogueira da vila", "does": "Dá as missões da história; a primeira abre as bancas do mercado.",
         "sells": []},
        {"name": "Estalajadeiro", "where": "Taberna", "does": "Vende comida e bebida; descansa-se aqui por %s moedas (uma vez por dia)." % rules.get("rest_price", "?"),
         "sells": shop_items(rules.get("innkeeper_stock", {}))},
        {"name": "Ferreiro", "where": "Forja", "does": "Vende armas, escudo, armaduras e munição; refaz o encantamento das peças.",
         "sells": shop_items(rules.get("blacksmith_stock", {}))},
        {"name": "Feiticeiro", "where": "Na vila (torre do feiticeiro)", "does": "Vende poções e pergaminhos de regresso.",
         "sells": shop_items(rules.get("wizard_stock", {}))},
        {"name": "Tratador de cavalos", "where": "Estábulo", "does": "Vende cavalos.",
         "sells": shop_items(rules.get("stableman_stock", {}))},
    ]
    for stock in rules.get("stocks", []):
        villagers.append({"name": tr(stock["name"]), "where": "Mercado da vila (bancas)",
                          "does": "Um em cada %s aldeões é vendedor de comida." % rules.get("store_every", 3),
                          "sells": [iname(i) for i in stock.get("items", [])]})
    for v in villagers:
        v["name"] = tr(v["name"])
    personalities = [{"name": tr(p.get("tone", p["id"])), "id": p["id"],
                      "greetings": [tr(g) for g in p.get("greetings", [])],
                      "reactions": {k: [tr(x) for x in v] for k, v in p.get("reactions", {}).items()}}
                     for p in raw["personalities"]]

    quests = [{"id": q["id"], "title": tr(q.get("title", "")), "goal": q.get("goal", "kill"), "target": q.get("target", ""),
               "count": q.get("count", 1), "request": tr(q.get("request_text", "")), "done": tr(q.get("done_text", "")),
               "effect": q.get("effect", "")} for q in raw["quests"]]
    blessings = [{"id": b["id"], "name": tr(b["display_name"]), "desc": tr(b.get("description", "")),
                  "effects": b.get("effects", {}), "minutes": b.get("duration_minutes", 1440), "shrine": b.get("at_shrine", True)}
                 for b in raw["blessings"]]
    powers = [{"id": p["id"], "name": tr(p["display_name"]), "desc": tr(p.get("description", ""))} for p in raw["powers"]]
    enh = [{"id": x["id"], "name": tr(x.get("display_name", x["id"])), "multiplier": x.get("multiplier", 1.0), "weight": x.get("weight", 1.0)}
           for x in raw["enhancements"]]

    commit = subprocess.run(["git", "-C", str(GAME), "log", "-1", "--format=%h"], capture_output=True, text=True).stdout.strip()
    data = {
        "generated": datetime.date.today().isoformat(), "game_commit": commit,
        "categories": CATEGORIES, "items": items, "enemies": enemies, "villagers": villagers,
        "personalities": personalities, "quests": quests, "blessings": blessings, "powers": powers, "enhancements": enh,
        "s": raw["stats"], "r": {k: v for k, v in rules.items() if not isinstance(v, (dict, list))},
        "spawn_rows": raw.get("enemy_rows", {}).get("rows", []),
    }
    out = ROOT / "data" / "wiki_data.js"
    text = ("// Generated by tools/build_wiki.py from the game's data. Do not edit by hand.\n"
            "const WIKI = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n")
    if "--check" in sys.argv:
        old = out.read_text(encoding="utf-8") if out.exists() else ""
        strip = lambda t: json.loads(t[t.index("{"):t.rindex("}") + 1]) if "{" in t else {}
        a, b = strip(old), strip(text)
        for k in ("generated", "game_commit"):
            a.pop(k, None)
            b.pop(k, None)
        if a == b:
            print("wiki: up to date")
            return
        for k in sorted(set(a) | set(b)):
            if a.get(k) != b.get(k):
                print("wiki: out of date in '%s'" % k)
        sys.exit(1)
    out.write_text(text, encoding="utf-8")
    print("wiki: %d items, %d enemies, %d villager roles, %d quests -> %s" % (len(items), len(enemies), len(villagers), len(quests), out))


if __name__ == "__main__":
    main()
