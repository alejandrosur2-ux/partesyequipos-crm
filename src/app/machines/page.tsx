let query = sb
  .from("machines")
  .select("id,name,serial,status,daily_rate,created_at", { count: "exact" })
  .is("deleted_at", null)   // 👈 filtra solo las que no están borradas
  .order("created_at", { ascending: false });
