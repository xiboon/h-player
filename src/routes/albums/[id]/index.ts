import { FastifyRequest } from "fastify";
import { Route } from "fastify-file-routes";

export const routes: Route = {
	get: {
		handler: async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
			if (!req.params.id) {
				res.code(400).send({ error: "No id specified" });
				return;
			}
			const id = parseInt(req.params.id);
			if (Number.isNaN(id)) {
				res.code(400).send({ error: "ID must be a number" });
				return;
			}
			const album = await req.db.album.findUnique({ where: { id } });
			if (!album) {
				res.code(404).send({ error: "Album not found" });
				return;
			}
			const transformedAlbum = await req.transformers.transformAlbum(album);
			res.code(200).send(transformedAlbum);
		},
	},
};