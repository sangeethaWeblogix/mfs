 const API_BASE =process.env.NEXT_PUBLIC_MFS_API_BASE;
const API_KEY = process.env.MFS_API_KEY; // ✅ Add this

// api/productList/api.ts
 export const fetchMakeDetails = async () => {
  try {
    const res = await fetch(`/api/make-details/`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    
    return json?.data?.make_options || [];
  } catch {
    return [];
  }
};

