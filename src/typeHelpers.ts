import { Request, Response } from "express";

export interface RequestContext {
  request: Request;
  response: Response;
}
