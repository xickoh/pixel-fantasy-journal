extends Node
## Exports the game's data (items, recipes, enemies, shops, villagers, quests, blessings, powers and the
## player's stats) to a JSON file for the wiki (tools/build_wiki.py runs it and builds data/wiki_data.js).
## It reads the .tres files of the game; the numbers that depend on code (an enemy's health at a level,
## a weapon's damage...) come from the game's own functions, so the wiki and the game cannot disagree.
## Run (a scene, not --script: the game's autoloads only compile in a normal run):
##   flatpak run org.godotengine.Godot --headless --path <game> <this folder>/export_wiki.tscn -- <out.json>
## (the flatpak doesn't see /tmp: the output goes under /home/deck).

const LEVELS := [1, 10, 20, 30, 40]
## Properties that are pictures, scenes or plumbing, not facts for a reader.
const SKIP := ["icon", "sprite_frames", "attack_frames", "equipment_frames", "impact_frames", "projectile_scene",
		"placeable_scene", "weapon_textures", "back_texture", "projectile_texture", "palette", "script", "weapon_offset",
		"held_pose", "shadow_width"]


func _ready() -> void:
	_run.call_deferred()


func _run() -> void:
	var args := OS.get_cmdline_user_args()
	var out_path: String = args[0] if not args.is_empty() else "res://wiki.json"
	var out := {
		"items": _items(),
		"recipes": _recipes(),
		"enemies": _enemies(),
		"stores": _stores(),
		"personalities": _each("res://data/personalities/"),
		"quests": _quests(),
		"blessings": _each("res://data/blessings/"),
		"powers": _each("res://items/powers/"),
		"enhancements": _each("res://items/enhancements/"),
		"stats": _plain("res://data/player_stats.tres"),
		"enemy_rows": _plain("res://data/enemy_rows.tres"),
		"store_rules": _plain("res://data/store_rules.tres"),
		"villager_roles": _roles(),
		"starting_kit": _plain("res://data/starting_kit.tres"),  # prompt 424
	}
	var f := FileAccess.open(out_path, FileAccess.WRITE)
	if f == null:
		push_error("cannot write " + out_path)
		get_tree().quit(1)
		return
	f.store_string(JSON.stringify(out, "\t", true))
	f.close()
	print("WIKI exported: %d items, %d recipes, %d enemies" % [out["items"].size(), out["recipes"].size(), out["enemies"].size()])
	get_tree().quit()


# --- files ---

func _tres(dir: String, recursive := true) -> Array[String]:
	var found: Array[String] = []
	var d := DirAccess.open(dir)
	if d == null:
		return found
	for name in d.get_files():
		var n := name.trim_suffix(".remap")
		if n.ends_with(".tres"):
			found.append(dir.path_join(n))
	if recursive:
		for sub in d.get_directories():
			found.append_array(_tres(dir.path_join(sub), true))
	found.sort()
	return found


func _each(dir: String) -> Array:
	var rows := []
	for path in _tres(dir):
		var r := load(path)
		if r != null:
			rows.append(_props(r, 0))
	return rows


func _plain(path: String) -> Dictionary:
	var r := load(path)
	return _props(r, 0, true) if r != null else {}


# --- generic: the exported properties that differ from the class default ---

func _props(r: Resource, depth: int, all := false) -> Dictionary:
	var d := {}
	var fresh: Object = null
	var script: Script = r.get_script()
	if script != null and script.can_instantiate():
		fresh = script.new()
	for p in r.get_property_list():
		if not (p["usage"] & PROPERTY_USAGE_SCRIPT_VARIABLE) or not (p["usage"] & PROPERTY_USAGE_STORAGE):
			continue
		var key: String = p["name"]
		if key in SKIP:
			continue
		var v: Variant = r.get(key)
		if not all and fresh != null and typeof(fresh.get(key)) == typeof(v) and fresh.get(key) == v:
			continue
		var j: Variant = _json(v, depth)
		if j != null:
			d[key] = j
	return d


func _json(v: Variant, depth: int) -> Variant:
	match typeof(v):
		TYPE_NIL:
			return null
		TYPE_BOOL, TYPE_INT, TYPE_STRING:
			return v
		TYPE_FLOAT:
			return snappedf(v, 0.0001) if is_finite(v) else null
		TYPE_STRING_NAME:
			return String(v)
		TYPE_VECTOR2:
			return null if not is_finite(v.x) else [v.x, v.y]
		TYPE_COLOR:
			return "#" + v.to_html(false)
		TYPE_DICTIONARY:
			var d := {}
			for k in v:
				var j: Variant = _json(v[k], depth + 1)
				if j != null:
					d[str(k)] = j
			return d
		TYPE_ARRAY, TYPE_PACKED_STRING_ARRAY, TYPE_PACKED_FLOAT32_ARRAY, TYPE_PACKED_INT32_ARRAY:
			var a := []
			for e in v:
				var j: Variant = _json(e, depth + 1)
				if j != null:
					a.append(j)
			return a
		TYPE_OBJECT:
			if v is ItemData or v is EnemyData:
				return String(v.id)
			if v is Resource:
				if depth >= 4:
					return null
				var d := _props(v, depth + 1)
				return d if not d.is_empty() else null
	return null


# --- items ---

func _items() -> Array:
	var rows := []
	for path in _tres("res://items/"):
		var r := load(path)
		if not (r is ItemData):
			continue
		var item: ItemData = r
		var d := _props(item, 0)
		d["id"] = String(item.id)
		d["name"] = item.display_name
		d["path"] = path.trim_prefix("res://")
		d["category"] = String(item.category)
		if item.strength > 0 or item.defense > 0 or item.damage_reduction > 0 or item.max_health_bonus > 0:
			d["stat_values"] = _json(ItemStats.stat_values(item, &""), 1)
		var rules = load("res://data/store_rules.tres")
		if rules != null and item.category != &"loot" and item.category != &"weapon_power":
			d["sell_price"] = rules.sell_price(item)
		if item.summons != null:
			d["summons"] = String(item.summons.id)
		if item.calls_horse != null:
			d["horse"] = _props(item.calls_horse, 1)
		if item.ally != null:
			d["ally"] = _props(item.ally, 1)
		if item.teaches_recipe != null and item.teaches_recipe.result != null:
			d["teaches"] = String(item.teaches_recipe.result.id)
		if Requirements.skill_of(item) >= 0:  # prompts 425 and 426: the skill level it needs (the game's rule)
			d["requires"] = [Skills.NAMES[Requirements.skill_of(item)], Requirements.level_of(item)]
		rows.append(d)
	return rows


func _recipes() -> Array:
	var rows := []
	for path in _tres("res://items/recipes/"):
		var rc := load(path)
		if rc is Recipe and rc.result != null:
			var ing := {}
			for k in rc.ingredients:
				ing[String(k)] = rc.ingredients[k]
			rows.append({"result": String(rc.result.id), "amount": rc.result_amount, "ingredients": ing,
					"station": String(rc.station), "hidden": rc.hidden})
	return rows


# --- enemies ---

func _enemies() -> Array:
	var rows := []
	for path in _tres("res://entities/enemies/types/", false):
		var e := load(path)
		if not (e is EnemyData):
			continue
		var d := _props(e, 0)
		d["id"] = String(e.id)
		d["name"] = e.display_name
		d["boss_rules"] = _props(e.boss, 1, true) if e.boss != null else {}
		d["boss"] = e.is_boss()
		if e.archetype != null:
			d["archetype"] = String(e.archetype.id)
		d["weapon_id"] = String(e.weapon.id) if e.weapon != null else ""
		var levels := {}
		for lv in LEVELS:
			levels[str(lv)] = {"health": e.health_at(lv), "damage": e.damage_at(lv),
					"defense": snappedf(e.defense_at(lv), 0.01), "speed": snappedf(e.speed_at(lv), 0.1)}
		d["levels"] = levels
		if e.ranged:
			d["shot_damage_l1"] = e.damage_at(1, e.shot_damage)
		d["crit"] = e.critical_chance()
		var loot := []
		for le in e.loot:
			var names := []
			for it in le.possible_items():
				names.append(String(it.id))
			loot.append({"items": names, "chance": le.drop_chance(), "min": le.amount_min(), "max": le.amount_max(),
					"weapon_drop": le.weapon_drop, "group": String(le.group.id) if le.group != null else ""})
		d["loot_table"] = loot
		rows.append(d)
	return rows


# --- shops and villagers ---

func _stores() -> Array:
	var rows := []
	for path in _tres("res://data/stores/", false):
		var s := load(path)
		if s is StoreStock:
			var items := []
			var rules = load("res://data/store_rules.tres")
			for it in s.items:
				items.append({"id": String(it.id), "price": rules.price(it) if rules != null else 0})
			var offers := []
			for o in s.offers:
				if o != null and o.item != null:
					offers.append({"item": String(o.item.id), "amount": o.amount, "price": o.price})
			rows.append({"file": path.get_file().get_basename(), "name": s.name, "items": items, "offers": offers})
	return rows


func _roles() -> Dictionary:
	var rules := load("res://data/store_rules.tres")
	var d := {}
	if rules == null:
		return d
	for key in ["blacksmith_index", "innkeeper_index", "wizard_index", "stableman_index"]:
		d[key] = rules.get(key)
	return d


func _quests() -> Array:
	var rows := []
	var book := load("res://data/quests.tres")
	if book != null:
		var j: Variant = _json(book, 0)
		if j is Dictionary:
			# the story's quests, then the other givers' (prompt 396: side_quests, each with its giver)
			for key in ["quests", "side_quests"]:
				if j.get(key) is Array:
					rows.append_array(j[key])
	return rows
