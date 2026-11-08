extends Node
## Writes the game's compendium data (CompendiumData.build(), the game's systems/compendium/compendium_data.gd: the
## in-game Compendium's one source, prompt 649) in Portuguese to a JSON file; tools/build_wiki.py runs it and writes
## data/wiki_data.js. Nothing is worked out here: a change to the wiki's data is a change to the game's builder.
## Run (a scene, not --script: the game's autoloads only compile in a normal run):
##   flatpak run org.godotengine.Godot --headless --path <game> <this folder>/export_wiki.tscn -- <out.json>
## (the flatpak doesn't see /tmp: the output goes under /home/deck).


func _ready() -> void:
	_run.call_deferred()


func _run() -> void:
	var args := OS.get_cmdline_user_args()
	var out_path: String = args[0] if not args.is_empty() else "res://wiki.json"
	TranslationServer.set_locale("pt")
	var out := CompendiumData.build()
	var f := FileAccess.open(out_path, FileAccess.WRITE)
	if f == null:
		push_error("cannot write " + out_path)
		get_tree().quit(1)
		return
	f.store_string(JSON.stringify(out, "", false))
	f.close()
	print("WIKI exported: %d items, %d enemies" % [out["items"].size(), out["enemies"].size()])
	get_tree().quit()
