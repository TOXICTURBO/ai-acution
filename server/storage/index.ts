import type { IStorage } from "./interface";
import { DatabaseStorage } from "./database";

// Export the storage interface for use in the application
export const storage: IStorage = new DatabaseStorage();