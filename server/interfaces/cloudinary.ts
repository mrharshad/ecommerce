export interface IDeleteResourcesResponse {
  deleted: {
    [public_id: string]: "deleted" | "not_found" | "error"; // public_ids ke aghar par delete hone par (deleted) image nhi hone par (not_found)
  };
  deleted_counts: {
    [public_id: string]: { original: 1 | 0; derived: 0 };
  };
  // original image ke delete hone par (1) milta hai nhi to (0) milta hai
  partial: boolean; // agar sabhi resources delete nhi hua hai to (true) hoga, anyatha (false)
  rate_limit_allowed: 500;
  rate_limit_reset_at: Date;
  rate_limit_remaining: 481;
}
