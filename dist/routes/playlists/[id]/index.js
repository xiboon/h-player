export const routes = {
    get: {
        handler: async (req, res) => {
            const id = parseInt(req.params.id);
            const playlist = await req.db.playlist.findUnique({ where: { id } });
            if (!playlist) {
                res.code(404).send({ error: "Playlist not found" });
                return;
            }
            res.send(await req.transformers.transformPlaylist(playlist, true));
        },
    },
    delete: {
        handler: async (req, res) => {
            const id = parseInt(req.params.id);
            if (!id || Number.isNaN(id)) {
                res.code(400).send({ error: "Invalid id" });
                return;
            }
            const playlist = await req.db.playlist.findUnique({ where: { id } });
            if (!playlist) {
                res.code(404).send({ error: "Playlist not found" });
                return;
            }
            await req.db.playlist.delete({ where: { id } });
            res.send({ success: true });
        },
    },
};
