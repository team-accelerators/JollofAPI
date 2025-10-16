import { IUser } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}


export {}; // <-- very important to make this a module