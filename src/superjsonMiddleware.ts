import express from "express";
import superjson from "superjson";

function superjsonMiddleware(
  request: express.Request,
  _response: express.Response,
  next: express.NextFunction,
) {
  if (request.method === "POST") {
    request.body = superjson.parse(request.body);
  }
  next();
}

export default superjsonMiddleware;
