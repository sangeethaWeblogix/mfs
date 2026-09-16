"use client";
import "../components/filter.css";
import { useState, useEffect, useRef } from "react";
import SearchSuggestionSkeleton from "../components/Searchsuggestionskeleton ";
import { fetchLocations } from "@/api/location/api";
import { fetchHomeSearchList, fetchKeywordSuggestions } from "@/api/homeSearch/api";
import { parseObfuscatedResponse, obfuscateUrl } from "@/lib/obfuscation";
import type { InitialParamsCount } from "./fetchInitialParamsCount";

type KeywordItem = { label: string; url?: string };

type LocationSuggestion = {
  key: string;
  uri: string;
  address: string;
  short_address: string;
  postcode?: string | number;
};

interface StateOption {
  value: string;
  name: string;
  regions?: { name: string; value: string }[];
}

export interface FilterState {
  category?: string;
  make?: string;
  model?: string;
  engine_make?: string;
  state?: string;
  region?: string;
  suburb?: string;
  pincode?: string;
  from_price?: string | number;
  to_price?: string | number;
  minKg?: string | number;
  maxKg?: string | number;
  condition?: string;
  from_sleep?: string | number;
  to_sleep?: string | number;
  acustom_fromyears?: string | number;
  acustom_toyears?: string | number;
  from_length?: string | number;
  to_length?: string | number;
  keyword?: string;
  [key: string]: any;
}

interface Props {
  currentFilters: FilterState;
  onFilterChange: (f: FilterState) => void;
  onClearAll: () => void;
  /** Server-fetched make/state counts — seeds the dropdowns from the first
   * render and skips the redundant client-side combined fetch on mount. */
  initialParamsCount?: InitialParamsCount | null;
}

const PRICE_OPTIONS  = [10000,20000,30000,40000,50000,60000,70000,80000,90000,100000,125000,150000,175000,200000,225000,250000,275000,300000];
const GVM_OPTIONS    = [600,800,1000,1250,1500,1750,2000,2250,2500,2750,3000,3500,4000,4500];
const SLEEP_OPTIONS  = [1,2,3,4,5,6,7];
const YEAR_OPTIONS   = [2027,2026,2025,2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010,2009,2008,2007,2006,2005,2004,2000,1975];
const LENGTH_OPTIONS = [12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];

/** Same param shape as FilterSlider's buildMakeCountParams — make/model excluded
 * on purpose (they're what group_by is counting), everything else included so
 * the make/model list narrows to what's actually available under the other
 * active filters, matching production's live /api/d2/ behaviour. */
const buildMakeCountParams = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.condition)         params.set("condition", filters.condition);
  if (filters.state)             params.set("state", String(filters.state).toLowerCase());
  if (filters.region)            params.set("region", filters.region);
  if (filters.suburb)            params.set("suburb", filters.suburb);
  if (filters.pincode)           params.set("pincode", filters.pincode);
  if (filters.from_price)        params.set("from_price", String(filters.from_price));
  if (filters.to_price)          params.set("to_price", String(filters.to_price));
  if (filters.minKg)             params.set("from_gvm", String(filters.minKg));
  if (filters.maxKg)             params.set("to_gvm", String(filters.maxKg));
  if (filters.acustom_fromyears) params.set("acustom_fromyears", String(filters.acustom_fromyears));
  if (filters.acustom_toyears)   params.set("acustom_toyears", String(filters.acustom_toyears));
  if (filters.from_length)       params.set("from_length", String(filters.from_length));
  if (filters.to_length)         params.set("to_length", String(filters.to_length));
  if (filters.from_sleep)        params.set("from_sleep", String(filters.from_sleep));
  if (filters.to_sleep)          params.set("to_sleep", String(filters.to_sleep));
  if (filters.keyword)           params.set("keyword", filters.keyword);
  params.set("group_by", "make");
  return params;
};

/** Same shape the /api/d2/?group_by=make,condition,state combined
 * response nests each state's region breakdown in — shared by the initial
 * state (server-fetched) and the client fallback fetch below. */
function paramsCountToStates(data?: InitialParamsCount | null): StateOption[] {
  return (data?.state || []).map((s) => ({
    name: s.name,
    value: s.slug,
    regions: (s.region || []).map((r) => ({ name: r.name, value: r.slug })),
  }));
}
function paramsCountToRegionMap(data?: InitialParamsCount | null): Record<string, { name: string; slug: string; count: number }[]> {
  const regionMap: Record<string, { name: string; slug: string; count: number }[]> = {};
  (data?.state || []).forEach((s) => {
    if (s.slug) regionMap[s.slug] = s.region || [];
  });
  return regionMap;
}

export default function StateFilterBar({ currentFilters, onFilterChange, onClearAll, initialParamsCount }: Props) {
  /* ── Data ── */
  const [states,     setStates]     = useState<StateOption[]>(() => paramsCountToStates(initialParamsCount));
  const [makes,      setMakes]      = useState<{name: string; slug: string; models?: {name: string; slug: string}[]}[]>(initialParamsCount?.make ?? []);
  const [catLoading, setCatLoading] = useState(!initialParamsCount);

  // Unscoped baseline from the initial combined fetch — restored when a
  // scoped filter is cleared instead of re-fetching the exact same unscoped
  // breakdown the combined call already gave us.
  const baselineMakeCountsRef = useRef<{name: string; slug: string; count: number; model?: {name: string; slug: string; count: number}[]}[]>(initialParamsCount?.make ?? []);
  const baselineRegionCountsByStateRef = useRef<Record<string, {name: string; slug: string; count: number}[]>>(paramsCountToRegionMap(initialParamsCount));

  // Single consolidated initial fetch — replaces the old separate
  // /api/product-list/ (states) and /api/make-details/ (makes) calls with one
  // /api/d2/?group_by=make,condition,state request. `data.make` is
  // used directly as the makes list (popular_makes is not used here).
  //
  // Server-side (page.tsx's fetchInitialParamsCount) already fetches this for
  // the initial render — skipped entirely here when that data is present, so
  // no client-visible request fires on page load. Only fires as a fallback if
  // the server-side fetch failed (initialParamsCount is null/undefined).
  useEffect(() => {
    if (initialParamsCount) { setCatLoading(false); return; }
    const controller = new AbortController();
    fetch(obfuscateUrl("/api/d2/?group_by=make,condition,state"), { signal: controller.signal })
      .then(r => parseObfuscatedResponse(r))
      .then((res: any) => {
        const data = res?.data;
        if (data) {
          setMakes(data.make || []);
          setMakeCounts(data.make || []);
          baselineMakeCountsRef.current = data.make || [];
          setStates((data.state || []).map((s: any) => ({
            name: s.name,
            value: s.slug,
            regions: (s.region || []).map((r: any) => ({ name: r.name, value: r.slug })),
          })));
          // Seed regionCountsByState from this same combined response (each
          // state entry already nests its region breakdown with counts) so the
          // no-filter initial page load doesn't need its own group_by=state call.
          const regionMap: Record<string, { name: string; slug: string; count: number }[]> = {};
          (data.state || []).forEach((s: any) => {
            if (s.slug) regionMap[s.slug] = (s.region || []).map((r: any) => ({ name: r.name, slug: r.slug, count: r.count }));
          });
          setRegionCountsByState(regionMap);
          baselineRegionCountsByStateRef.current = regionMap;
        }
        setCatLoading(false);
      })
      .catch(e => { if (e.name !== "AbortError") setCatLoading(false); });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Suburb search ── */
  const RADIUS_OPTIONS = [25, 50, 100, 250, 500, 1000] as const;
  const [tempSuburbRadius,         setTempSuburbRadius]         = useState<number>(RADIUS_OPTIONS[0]);
  const [tempSuburbSuggestion,     setTempSuburbSuggestion]     = useState<LocationSuggestion | null>(null);
  const [tempSuburbInput,          setTempSuburbInput]          = useState("");
  const [suburbLocationSuggestions,setSuburbLocationSuggestions]= useState<LocationSuggestion[]>([]);
  const [showSuburbSuggestions,    setShowSuburbSuggestions]    = useState(false);
  const [suburbLocLoading,         setSuburbLocLoading]         = useState(false);
  const suburbReqIdRef    = useRef(0);
  const suburbDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Make / Model ── */
  const [tempMake,      setTempMake]      = useState<string | null>(null);
  const [tempModel,     setTempModel]     = useState<string | null>(null);
  const [makeSearch,    setMakeSearch]    = useState("");
  const [modelSearch,   setModelSearch]   = useState("");
  const [makeSubView,   setMakeSubView]   = useState<"makes" | "models">("makes");
  const [makeCounts,       setMakeCounts]       = useState<{name: string; slug: string; count: number; model?: {name: string; slug: string; count: number}[]}[]>(initialParamsCount?.make ?? []);
  const [modelCounts,      setModelCounts]      = useState<{name: string; slug: string; count: number}[]>([]);

  /* ──  Vehicle Make (UI scaffolding — no data source wired up yet) ── */
  const [tempEngineMake, setTempEngineMake] = useState<string | null>(null);
  const [stateCounts,      setStateCounts]      = useState<{name?: string; slug: string; count: number; region?: {name: string; slug: string; count: number}[]}[]>([]);
  const [regionCountsByState, setRegionCountsByState] = useState<Record<string, {name: string; slug: string; count: number}[]>>(() => paramsCountToRegionMap(initialParamsCount));
  const [lastModelName,    setLastModelName]    = useState<string | null>(null);

  // Live make counts — same /api/d2/ endpoint FilterSlider uses,
  // re-fetched whenever any other active filter changes so the make list
  // narrows to what's actually available (not just the full static make list).
  useEffect(() => {
    // No scoping filter active — the initial combined call already fetched
    // this exact (unscoped) make breakdown, so reuse it instead of refetching.
    const hasScope =
      currentFilters.category || currentFilters.condition || currentFilters.state || currentFilters.region ||
      currentFilters.suburb || currentFilters.pincode || currentFilters.from_price || currentFilters.to_price ||
      currentFilters.minKg || currentFilters.maxKg || currentFilters.acustom_fromyears || currentFilters.acustom_toyears ||
      currentFilters.from_length || currentFilters.to_length || currentFilters.from_sleep || currentFilters.to_sleep ||
      currentFilters.keyword;
    if (!hasScope) {
      setMakeCounts(baselineMakeCountsRef.current);
      return;
    }

    const controller = new AbortController();
    const params = buildMakeCountParams(currentFilters);
    fetch(obfuscateUrl(`/api/d2/?${params.toString()}`), { signal: controller.signal })
      .then(r => parseObfuscatedResponse(r))
      .then(json => { if (!controller.signal.aborted) setMakeCounts(json?.data?.make ?? []); })
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();
  }, [
    currentFilters.category, currentFilters.condition, currentFilters.state, currentFilters.region,
    currentFilters.suburb, currentFilters.pincode, currentFilters.from_price, currentFilters.to_price,
    currentFilters.minKg, currentFilters.maxKg, currentFilters.acustom_fromyears, currentFilters.acustom_toyears,
    currentFilters.from_length, currentFilters.to_length, currentFilters.from_sleep, currentFilters.to_sleep,
    currentFilters.keyword,
  ]);

  // Live state counts — only used when a make filter is active (e.g. /listings/jayco/).
  // Calls /api/d2/?make={make}&group_by=state so the state list narrows
  // to only the states that actually have listings for that make.
  // Result is pre-warmed in KV by cfs-params-cache-warmer.php section 4.
  useEffect(() => {
    if (!currentFilters.make) { setStateCounts([]); return; }
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("make", currentFilters.make);
    if (currentFilters.category)          params.set("category", currentFilters.category);
    if (currentFilters.condition)         params.set("condition", currentFilters.condition);
    if (currentFilters.from_price)        params.set("from_price", String(currentFilters.from_price));
    if (currentFilters.to_price)          params.set("to_price", String(currentFilters.to_price));
    if (currentFilters.minKg)             params.set("from_gvm", String(currentFilters.minKg));
    if (currentFilters.maxKg)             params.set("to_gvm", String(currentFilters.maxKg));
    if (currentFilters.acustom_fromyears) params.set("acustom_fromyears", String(currentFilters.acustom_fromyears));
    if (currentFilters.acustom_toyears)   params.set("acustom_toyears", String(currentFilters.acustom_toyears));
    if (currentFilters.from_length)       params.set("from_length", String(currentFilters.from_length));
    if (currentFilters.to_length)         params.set("to_length", String(currentFilters.to_length));
    if (currentFilters.from_sleep)        params.set("from_sleep", String(currentFilters.from_sleep));
    if (currentFilters.to_sleep)          params.set("to_sleep", String(currentFilters.to_sleep));
    if (currentFilters.keyword)           params.set("keyword", currentFilters.keyword);
    params.set("group_by", "state");
    fetch(obfuscateUrl(`/api/d2/?${params.toString()}`), { signal: controller.signal })
      .then(r => parseObfuscatedResponse(r))
      .then(json => { if (!controller.signal.aborted) setStateCounts(json?.data?.state ?? []); })
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();
  }, [
    currentFilters.make, currentFilters.category, currentFilters.condition,
    currentFilters.from_price, currentFilters.to_price, currentFilters.minKg, currentFilters.maxKg,
    currentFilters.acustom_fromyears, currentFilters.acustom_toyears,
    currentFilters.from_length, currentFilters.to_length, currentFilters.from_sleep, currentFilters.to_sleep,
    currentFilters.keyword,
  ]);

  // Region breakdown per state is already nested inside each entry of the
  // group_by=state response above (params_count no longer accepts group_by=region
  // as its own value — it 400s). So instead of a second round of per-state
  // fetches, just fan the nested data already in stateCounts out into the
  // regionCountsByState shape the rest of the component expects.
  useEffect(() => {
    if (!stateCounts.length || !currentFilters.make) return;
    setRegionCountsByState(prev => {
      const next = { ...prev };
      stateCounts.forEach(sc => { if (sc.slug) next[sc.slug] = sc.region ?? []; });
      return next;
    });
  }, [stateCounts, currentFilters.make]);

  // Model breakdown per make is already nested inside each entry of the
  // group_by=make response (see "Live make counts" above) — params_count no
  // longer accepts group_by=model as its own value. Read the matching make's
  // nested list instead of firing a second (now-invalid) request.
  useEffect(() => {
    if (!tempMake) { setModelCounts([]); return; }
    const data = makeCounts.find(m => m.slug === tempMake)?.model ?? [];
    setModelCounts(data);
    const matched = data.find(m => m.slug === currentFilters.model);
    if (matched) setLastModelName(matched.name);
  }, [tempMake, makeCounts, currentFilters.model]);

  /* ── Temp filter values ── */
  const [tempState,        setTempState]        = useState<string | null>(null);
  const [tempRegion,       setTempRegion]       = useState<string | null>(null);
  const [tempRegionRaw,    setTempRegionRaw]    = useState<string | null>(null);
  const [tempCondition,    setTempCondition]    = useState<string | null>(null);
  const [tempPriceFrom,    setTempPriceFrom]    = useState<number | null>(null);
  const [tempPriceTo,      setTempPriceTo]      = useState<number | null>(null);
  const [tempGvmFrom,      setTempGvmFrom]      = useState<number | null>(null);
  const [tempGvmTo,        setTempGvmTo]        = useState<number | null>(null);
  const [tempSleepFrom,    setTempSleepFrom]    = useState<number | null>(null);
  const [tempSleepTo,      setTempSleepTo]      = useState<number | null>(null);
  const [tempYearFrom,     setTempYearFrom]     = useState<number | null>(null);
  const [tempYearTo,       setTempYearTo]       = useState<number | null>(null);
  const [tempLengthFrom,   setTempLengthFrom]   = useState<number | null>(null);
  const [tempLengthTo,     setTempLengthTo]     = useState<number | null>(null);
  const [tempKeyword,      setTempKeyword]      = useState<string>("");
  const [removingChip,     setRemovingChip]     = useState<string | null>(null);
  const [clearingAll,      setClearingAll]      = useState(false);

  const [locationSubView, setLocationSubView] = useState<"states" | "regions">("states");

  // Region counts when NO make is active (e.g. the plain /listings/ page).
  // group_by=state already nests each state's region breakdown (params_count
  // no longer accepts group_by=region as its own value), so one group_by=state
  // call — scoped by category/condition — populates every state's regions at
  // once instead of needing a fetch per state.
  useEffect(() => {
    if (currentFilters.make) return;
    // No category/condition scoping — the initial combined fetch already
    // seeded regionCountsByState with this exact (unscoped) breakdown.
    if (!currentFilters.category && !currentFilters.condition) {
      setRegionCountsByState(baselineRegionCountsByStateRef.current);
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({ group_by: "state" });
    if (currentFilters.category)  params.set("category", currentFilters.category);
    if (currentFilters.condition) params.set("condition", currentFilters.condition);
    fetch(obfuscateUrl(`/api/d2/?${params}`), { signal: controller.signal })
      .then(r => parseObfuscatedResponse(r))
      .then(json => {
        if (controller.signal.aborted) return;
        const data: { slug: string; region?: { name: string; slug: string; count: number }[] }[] = json?.data?.state ?? [];
        setRegionCountsByState(prev => {
          const next = { ...prev };
          data.forEach(sc => { if (sc.slug) next[sc.slug] = sc.region ?? []; });
          return next;
        });
      })
      .catch(e => { if (e.name !== "AbortError") console.error("[StateFilterBar] region fetch failed", e); });
    return () => controller.abort();
  }, [currentFilters.make, currentFilters.category, currentFilters.condition]);

  const [openModal, setOpenModal] = useState<
    "type"|"location"|"price"|"gvm"|"make"|"engineMake"|"condition"|"sleep"|"allFilters"|null
  >(null);

  /* ── Keyword search suggestions — same /api/home-search/ endpoint the
   * production filter modal uses: base/popular list on focus, live typed
   * suggestions (debounced) once the query is 2+ chars. ── */
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [baseKeywords,           setBaseKeywords]           = useState<KeywordItem[]>([]);
  const [baseLoading,            setBaseLoading]            = useState(false);
  const [keywordSuggestions,     setKeywordSuggestions]     = useState<KeywordItem[]>([]);
  const [keywordLoading,         setKeywordLoading]         = useState(false);

  useEffect(() => {
    if (openModal !== "allFilters") return;
    setBaseLoading(true);
    fetchHomeSearchList()
      .then((list) => {
        const items: KeywordItem[] = list.map((x) => ({
          label: (x.name ?? "").trim(),
          url: x.url ?? "",
        })).filter((i) => i.label);
        const uniq = Array.from(new Map(items.map((i) => [i.label, i])).values());
        setBaseKeywords(uniq);
      })
      .catch(() => setBaseKeywords([]))
      .finally(() => setBaseLoading(false));
  }, [openModal]);

  useEffect(() => {
    if (openModal !== "allFilters") return;
    const q = tempKeyword.trim();
    if (q.length < 2) { setKeywordSuggestions([]); setKeywordLoading(false); return; }

    const ctrl = new AbortController();
    setKeywordLoading(true);
    const t = setTimeout(async () => {
      try {
        const list = await fetchKeywordSuggestions(q, ctrl.signal);
        const items: KeywordItem[] = list.map((x) => ({ label: x.keyword.trim(), url: x.url }));
        setKeywordSuggestions(Array.from(new Map(items.map((i) => [i.label, i])).values()));
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setKeywordSuggestions([]);
      } finally {
        setKeywordLoading(false);
      }
    }, 300);

    return () => { ctrl.abort(); clearTimeout(t); };
  }, [tempKeyword, openModal]);

  useEffect(() => {
    document.body.style.overflow = openModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openModal]);

  useEffect(() => { setRemovingChip(null); }, [currentFilters]);

  /* ── Helpers ── */
  const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

  const AUS_ABBR: Record<string, string> = {
    VICTORIA:"VIC","NEW SOUTH WALES":"NSW",QUEENSLAND:"QLD","SOUTH AUSTRALIA":"SA",
    "WESTERN AUSTRALIA":"WA",TASMANIA:"TAS","NORTHERN TERRITORY":"NT","AUSTRALIAN CAPITAL TERRITORY":"ACT",
  };

  // State names from the API come hyphenated (e.g. "New-south-wales") — normalize
  // to spaces before uppercasing so multi-word states actually match AUS_ABBR
  // instead of falling back to a truncated, meaningless abbreviation.
  const abbrFor = (name: string) => AUS_ABBR[name.replace(/-/g, " ").toUpperCase()] ?? name.replace(/-/g, " ").toUpperCase();

  const formatLocationInput = (s: string) =>
    s.replace(/_/g," ").replace(/\s*-\s*/g,"  ").replace(/\s{3,}/g,"  ").trim()
     .replace(/\b\w/g, c => c.toUpperCase());

  const formatted = (s: string) => s.replace(/ - /g,"  ").replace(/\s+/g," ");

  const getValidRegionName = (stateName: string|null|undefined, regionName: string|null|undefined, allStates: StateOption[]) => {
    if (!stateName || !regionName) return undefined;
    const st = allStates.find(s => s.name.toLowerCase() === stateName.toLowerCase() || s.value.toLowerCase() === stateName.toLowerCase());
    if (!st?.regions?.length) return undefined;
    return st.regions.find(r => r.name.toLowerCase() === regionName.toLowerCase() || r.value.toLowerCase() === regionName.toLowerCase())?.name;
  };

  // Regions for the currently-viewed state — sourced live from regionCountsByState
  // (fetched either via the make-scoped bulk prefetch or the no-make lazy effect
  // above), since states[].regions is no longer available statically. Looked up
  // by matching tempState (a display name, e.g. "New South Wales") to its slug
  // via `states` rather than transforming the string directly — the API's name
  // formatting (spaces vs hyphens) doesn't reliably map onto its own slug for
  // multi-word states, so a direct tempState.toLowerCase() lookup silently
  // missed regions for every state except the single-word ones (Queensland,
  // Victoria, Tasmania).
  const tempStateSlug = tempState
    ? states.find(s => s.name.toLowerCase() === tempState.toLowerCase() || s.value.toLowerCase() === tempState.toLowerCase())?.value
    : undefined;
  const activeRegionCounts = tempStateSlug ? regionCountsByState[tempStateSlug.toLowerCase()] : undefined;
  const filteredRegions = (activeRegionCounts ?? [])
    .filter(rc => rc.count > 0)
    .map(rc => ({ name: rc.name, value: rc.slug }));

  // When a make filter is active, narrow the state list to only states with
  // count > 0 for that make. Falls back to the full list when no make is set
  // (global /listings/ page) or before the first API response arrives.
  const visibleStates = stateCounts.length > 0
    ? states.filter(s => stateCounts.some(sc => sc.slug === s.value && sc.count > 0))
    : states;

  const makeSource  = makeCounts.length > 0 ? makeCounts : makes.map(m => ({ name: m.name, slug: m.slug, count: 0 }));
  const filteredMakes = makeSearch
    ? (() => {
        const q = makeSearch.toLowerCase();
        return makeSource
          .filter(m => m.name.toLowerCase().includes(q))
          .sort((a, b) => {
            const an = a.name.toLowerCase(), bn = b.name.toLowerCase();
            const rank = (n: string) => n.startsWith(q) ? 0 : n.includes(` ${q}`) ? 1 : 2;
            return rank(an) - rank(bn);
          });
      })()
    : makeSource;
  const modelSource = modelCounts;
  const filteredModels = modelSearch
    ? (() => {
        const q = modelSearch.toLowerCase();
        return modelSource
          .filter(m => m.name.toLowerCase().includes(q))
          .sort((a, b) => {
            const an = a.name.toLowerCase(), bn = b.name.toLowerCase();
            const rank = (n: string) => n.startsWith(q) ? 0 : n.includes(` ${q}`) ? 1 : 2;
            return rank(an) - rank(bn);
          });
      })()
    : modelSource;

  /* ── Core update fn ── */
  const updateFiltersAndURL = (updates: Partial<FilterState>) => {
    const merged: FilterState = { ...currentFilters, ...updates };
    Object.keys(merged).forEach(k => { if (merged[k] === undefined || merged[k] === null) delete merged[k]; });
    onFilterChange(merged);
  };

  const removeChip = (key: string, updates: Partial<FilterState>) => {
    setRemovingChip(key);
    updateFiltersAndURL(updates);
  };

  const handleClearAll = () => {
    setClearingAll(true);
    onClearAll();
    setTimeout(() => setClearingAll(false), 300);
  };

  /* ── Condition ── */
  const handleConditionOpen   = () => { setTempCondition(currentFilters.condition?.toLowerCase() ?? null); setOpenModal("condition"); };
  const handleConditionSearch = () => { updateFiltersAndURL({ condition: tempCondition ?? undefined }); setOpenModal(null); };
  const handleConditionClear  = () => { setTempCondition(null); updateFiltersAndURL({ condition: undefined }); setOpenModal(null); };

  /* ── Price ── */
  const handlePriceOpen   = () => { setTempPriceFrom(currentFilters.from_price ? Number(currentFilters.from_price) : null); setTempPriceTo(currentFilters.to_price ? Number(currentFilters.to_price) : null); setOpenModal("price"); };
  const handlePriceSearch = () => { updateFiltersAndURL({ from_price: tempPriceFrom ?? undefined, to_price: tempPriceTo ?? undefined }); setOpenModal(null); };
  const handlePriceClear  = () => { setTempPriceFrom(null); setTempPriceTo(null); updateFiltersAndURL({ from_price: undefined, to_price: undefined }); setOpenModal(null); };

  /* ──GVM ── */
  const handleGvmOpen   = () => { setTempGvmFrom(currentFilters.minKg ? Number(currentFilters.minKg) : null); setTempGvmTo(currentFilters.maxKg ? Number(currentFilters.maxKg) : null); setOpenModal("gvm"); };
  const handleGvmSearch = () => { updateFiltersAndURL({ minKg: tempGvmFrom ?? undefined, maxKg: tempGvmTo ?? undefined }); setOpenModal(null); };
  const handleGvmClear  = () => { setTempGvmFrom(null); setTempGvmTo(null); updateFiltersAndURL({ minKg: undefined, maxKg: undefined }); setOpenModal(null); };

  /* ── Sleep ── */
  const handleSleepOpen   = () => { setTempSleepFrom(currentFilters.from_sleep ? Number(currentFilters.from_sleep) : null); setTempSleepTo(currentFilters.to_sleep ? Number(currentFilters.to_sleep) : null); setOpenModal("sleep"); };
  const handleSleepSearch = () => { updateFiltersAndURL({ from_sleep: tempSleepFrom ?? undefined, to_sleep: tempSleepTo ?? undefined }); setOpenModal(null); };
  const handleSleepClear  = () => { setTempSleepFrom(null); setTempSleepTo(null); updateFiltersAndURL({ from_sleep: undefined, to_sleep: undefined }); setOpenModal(null); };

  /* ── Make ── */
  const handleMakeOpen = () => { setTempMake(currentFilters.make ?? null); setTempModel(currentFilters.model ?? null); setMakeSearch(""); setModelSearch(""); setMakeSubView("makes"); setOpenModal("make"); };
  const handleMakeSearch = () => { updateFiltersAndURL({ make: tempMake ?? undefined, model: tempModel ?? undefined }); setOpenModal(null); };
  const handleMakeClear  = () => { setTempMake(null); setTempModel(null); updateFiltersAndURL({ make: undefined, model: undefined }); setOpenModal(null); };
  const handleModelViewOpen = (makeSlug?: string) => {
    const target = makeSlug ?? tempMake;
    if (!target) return;
    if (makeSlug && makeSlug !== tempMake) { setTempMake(makeSlug); setTempModel(null); }
    setModelSearch("");
    setMakeSubView("models");
  };

  /* ──  Vehicle Make (UI scaffolding — no data source wired up yet) ── */
  const handleEngineMakeOpen   = () => { setTempEngineMake(currentFilters.engine_make ?? null); setOpenModal("engineMake"); };
  const handleEngineMakeSearch = () => { updateFiltersAndURL({ engine_make: tempEngineMake ?? undefined }); setOpenModal(null); };
  const handleEngineMakeClear  = () => { setTempEngineMake(null); updateFiltersAndURL({ engine_make: undefined }); setOpenModal(null); };

  /* ── Location ── */
  const handleLocationOpen = () => {
    const f = currentFilters;
    const matchedState = states.find(s => s.name?.toLowerCase() === (f.state ?? "").toLowerCase() || s.value?.toLowerCase() === (f.state ?? "").toLowerCase());
    setTempState(matchedState?.name ?? f.state ?? null);
    const matchedRegion = matchedState?.regions?.find(r => r.name?.toLowerCase() === (f.region ?? "").toLowerCase() || r.value?.toLowerCase() === (f.region ?? "").toLowerCase());
    if (matchedRegion) { setTempRegion(matchedRegion.name); setTempRegionRaw(null); }
    else if (f.region) { setTempRegion(null); setTempRegionRaw(f.region); }
    else { setTempRegion(null); setTempRegionRaw(null); }
    if (f.suburb && f.state) {
      const abbr = abbrFor(f.state);
      const shortAddr = [toTitleCase(f.suburb), abbr, f.pincode].filter(Boolean).join(" ");
      const fullAddr  = [toTitleCase(f.suburb), f.state.replace(/\b\w/g, c => c.toUpperCase()), f.pincode].filter(Boolean).join(" ");
      const stateSlug  = f.state.toLowerCase().replace(/\s+/g,"-") + "-state";
      const regionSlug = f.region ? f.region.toLowerCase().replace(/\s+/g,"-") + "-region" : "unknown-region";
      const suburbSlug = f.suburb.toLowerCase().replace(/\s+/g,"-") + "-suburb";
      const uri = [stateSlug, regionSlug, suburbSlug, f.pincode].filter(Boolean).join("/");
      setTempSuburbSuggestion({ key:"hydrated", uri, address:fullAddr, short_address:shortAddr });
      setTempSuburbInput("");
    } else { setTempSuburbInput(""); setTempSuburbSuggestion(null); }
    setSuburbLocationSuggestions([]);
    setShowSuburbSuggestions(false);
    setTempSuburbRadius(f.radius_kms ? Number(f.radius_kms) : RADIUS_OPTIONS[0]);
    setLocationSubView("states");
    setOpenModal("location");
  };
  const handleLocationSearch = () => { updateFiltersAndURL({ state: tempState?.toLowerCase() ?? undefined, region: tempRegion?.toLowerCase() ?? tempRegionRaw?.toLowerCase() ?? undefined, suburb: undefined, pincode: undefined }); setOpenModal(null); };
  const handleLocationClear  = () => { setTempState(null); setTempRegion(null); setTempRegionRaw(null); setTempSuburbInput(""); setTempSuburbSuggestion(null); updateFiltersAndURL({ state:undefined, region:undefined, suburb:undefined, pincode:undefined, radius_kms:undefined }); setOpenModal(null); };
  const handleRegionViewOpen = (stateName?: string) => {
    const target = stateName ?? tempState;
    if (!target) return;
    if (stateName) { setTempState(stateName); if (stateName.toLowerCase() !== (tempState ?? "").toLowerCase()) setTempRegion(null); }
    setLocationSubView("regions");
  };

  /* ── All Filters (combined modal) ── */
  const handleAllFiltersOpen = () => {
    setTempCondition(currentFilters.condition?.toLowerCase() ?? null);
    setTempPriceFrom(currentFilters.from_price ? Number(currentFilters.from_price) : null);
    setTempPriceTo(currentFilters.to_price ? Number(currentFilters.to_price) : null);
    setTempGvmFrom(currentFilters.minKg ? Number(currentFilters.minKg) : null);
    setTempGvmTo(currentFilters.maxKg ? Number(currentFilters.maxKg) : null);
    setTempSleepFrom(currentFilters.from_sleep ? Number(currentFilters.from_sleep) : null);
    setTempSleepTo(currentFilters.to_sleep ? Number(currentFilters.to_sleep) : null);
    setTempMake(currentFilters.make ?? null);
    setTempModel(currentFilters.model ?? null);
    setMakeSearch("");
    setTempEngineMake(currentFilters.engine_make ?? null);
    setTempYearFrom(currentFilters.acustom_fromyears ? Number(currentFilters.acustom_fromyears) : null);
    setTempYearTo(currentFilters.acustom_toyears ? Number(currentFilters.acustom_toyears) : null);
    setTempLengthFrom(currentFilters.from_length ? Number(currentFilters.from_length) : null);
    setTempLengthTo(currentFilters.to_length ? Number(currentFilters.to_length) : null);
    setTempKeyword(currentFilters.keyword ?? "");
    if (currentFilters.suburb && currentFilters.state) {
      const abbr = abbrFor(currentFilters.state);
      const shortAddr = [toTitleCase(currentFilters.suburb), abbr, currentFilters.pincode].filter(Boolean).join(" ");
      const fullAddr  = [toTitleCase(currentFilters.suburb), currentFilters.state.replace(/\b\w/g, c => c.toUpperCase()), currentFilters.pincode].filter(Boolean).join(" ");
      const stateSlug  = currentFilters.state.toLowerCase().replace(/\s+/g,"-") + "-state";
      const regionSlug = currentFilters.region ? currentFilters.region.toLowerCase().replace(/\s+/g,"-") + "-region" : "unknown-region";
      const suburbSlug = currentFilters.suburb.toLowerCase().replace(/\s+/g,"-") + "-suburb";
      const uri = [stateSlug, regionSlug, suburbSlug, currentFilters.pincode].filter(Boolean).join("/");
      setTempSuburbSuggestion({ key:"hydrated", uri, address:fullAddr, short_address:shortAddr });
      setTempSuburbInput("");
    } else {
      setTempSuburbInput(""); setTempSuburbSuggestion(null);
    }
    setSuburbLocationSuggestions([]); setShowSuburbSuggestions(false);
    setTempSuburbRadius(currentFilters.radius_kms ? Number(currentFilters.radius_kms) : RADIUS_OPTIONS[0]);
    const matchedState = states.find(s => s.name?.toLowerCase() === (currentFilters.state ?? "").toLowerCase() || s.value?.toLowerCase() === (currentFilters.state ?? "").toLowerCase());
    setTempState(matchedState?.name ?? currentFilters.state ?? null);
    const matchedRegion = matchedState?.regions?.find(r => r.name?.toLowerCase() === (currentFilters.region ?? "").toLowerCase() || r.value?.toLowerCase() === (currentFilters.region ?? "").toLowerCase());
    setTempRegion(matchedRegion?.name ?? currentFilters.region ?? null);
    setOpenModal("allFilters");
  };
  const handleAllFiltersSearch = () => {
    let suburbName: string | undefined;
    let pincodeValue: string | undefined;
    let stateOverride: string | undefined;
    let regionOverride: string | undefined;
    if (tempSuburbSuggestion) {
      const parts = tempSuburbSuggestion.uri.split("/").filter(Boolean);
      const suburbPart = parts.find((p: string) => p.endsWith("-suburb"));
      suburbName  = suburbPart?.replace(/-suburb$/, "").replace(/-/g, " ");
      pincodeValue = parts.find((p: string) => /^\d{4}$/.test(p));
      stateOverride  = parts[0]?.replace(/-state$/, "").replace(/-/g, " ");
      regionOverride = parts[1]?.replace(/-region$/, "").replace(/-/g, " ");
    }
    const updates: Partial<FilterState> = {
      condition:         tempCondition ?? undefined,
      from_price:        tempPriceFrom ?? undefined,
      to_price:          tempPriceTo ?? undefined,
      minKg:             tempGvmFrom ?? undefined,
      maxKg:             tempGvmTo ?? undefined,
      from_sleep:        tempSleepFrom ?? undefined,
      to_sleep:          tempSleepTo ?? undefined,
      make:              tempMake ?? undefined,
      model:             tempModel ?? undefined,
      engine_make:       tempEngineMake ?? undefined,
      state:             (stateOverride ?? tempState)?.toLowerCase() ?? undefined,
      region:            (regionOverride ?? tempRegion)?.toLowerCase() ?? undefined,
      suburb:            suburbName ?? undefined,
      pincode:           pincodeValue ?? undefined,
      radius_kms:        suburbName ? tempSuburbRadius : undefined,
      acustom_fromyears: tempYearFrom ?? undefined,
      acustom_toyears:   tempYearTo ?? undefined,
      from_length:       tempLengthFrom ?? undefined,
      to_length:         tempLengthTo ?? undefined,
      keyword:           tempKeyword || undefined,
    };
    updateFiltersAndURL(updates);
    setOpenModal(null);
  };
  const handleAllFiltersClear = () => { onClearAll(); setOpenModal(null); };

  /* ── Active filter count (for Filters badge) ── */
  const activeFilterCount = [
    currentFilters.state || currentFilters.region || currentFilters.suburb,
    currentFilters.condition,
    currentFilters.make,
    currentFilters.from_price || currentFilters.to_price,
    currentFilters.minKg || currentFilters.maxKg,
    currentFilters.from_sleep || currentFilters.to_sleep,
  ].filter(Boolean).length;

  const hasLocationChange =
    (tempState?.toLowerCase() ?? null) !== (currentFilters.state?.toLowerCase() ?? null) ||
    (tempRegion?.toLowerCase() ?? null) !== (currentFilters.region?.toLowerCase() ?? null);

  /* ── Close button ── */
  const closeBtn = (
    <button className="filter-close" onClick={() => setOpenModal(null)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 64 64">
        <path d="M 16 14 C 15.488 14 14.976938 14.194937 14.585938 14.585938 C 13.804937 15.366937 13.804937 16.633063 14.585938 17.414062 L 29.171875 32 L 14.585938 46.585938 C 13.804938 47.366938 13.804937 48.633063 14.585938 49.414062 C 14.976937 49.805062 15.488 50 16 50 C 16.512 50 17.023062 49.805062 17.414062 49.414062 L 32 34.828125 L 46.585938 49.414062 C 47.366938 50.195063 48.633063 50.195062 49.414062 49.414062 C 50.195063 48.633062 50.195062 47.366937 49.414062 46.585938 L 34.828125 32 L 49.414062 17.414062 C 50.195063 16.633063 50.195062 15.366938 49.414062 14.585938 C 48.633062 13.804938 47.366937 13.804938 46.585938 14.585938 L 32 29.171875 L 17.414062 14.585938 C 17.023062 14.194938 16.512 14 16 14 z"></path>
      </svg>
    </button>
  );

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="lsd-filter-section">
        <div className="container">
          <div className="search-bar">
            {/* Filters button — matches /listings/ design */}
            <button className="filter-btn" onClick={handleAllFiltersOpen}>
              {activeFilterCount > 0 ? (
                <span>{activeFilterCount}</span>
              ) : (
                <span><i className="bi bi-filter" /></span>
              )}{" "}
              Filters
            </button>

            {/* Pills */}
            <div className="filter-row" style={{ flex: 1, marginBottom: 0 }}>
              <div className="slider-wrapper">
                <div className="filter-swiper">
                  <button className={`tag${(currentFilters.state || currentFilters.region || currentFilters.suburb) ? " active" : ""}`} onClick={handleLocationOpen}>
                    Location
                    {(currentFilters.state || currentFilters.region || currentFilters.suburb) && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${currentFilters.condition ? " active" : ""}`} onClick={handleConditionOpen}>
                    Condition
                    {currentFilters.condition && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${currentFilters.make ? " active" : ""}`} onClick={handleMakeOpen}>
                    Make
                    {currentFilters.make && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${currentFilters.engine_make ? " active" : ""}`} onClick={handleEngineMakeOpen}>
                     Vehicle Make
                    {currentFilters.engine_make && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${(currentFilters.from_price || currentFilters.to_price) ? " active" : ""}`} onClick={handlePriceOpen}>
                    Price
                    {(currentFilters.from_price || currentFilters.to_price) && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${(currentFilters.minKg || currentFilters.maxKg) ? " active" : ""}`} onClick={handleGvmOpen}>
                   GVM
                    {(currentFilters.minKg || currentFilters.maxKg) && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>

                  <button className={`tag${(currentFilters.from_sleep || currentFilters.to_sleep) ? " active" : ""}`} onClick={handleSleepOpen}>
                    Sleeps
                    {(currentFilters.from_sleep || currentFilters.to_sleep) && <span className="active_filter"><i className="bi bi-circle-fill" /></span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active chips row ── */}
      {(currentFilters.state || currentFilters.region || currentFilters.suburb ||
        currentFilters.make || currentFilters.model || currentFilters.engine_make || currentFilters.from_price || currentFilters.to_price ||
        currentFilters.minKg || currentFilters.maxKg || currentFilters.condition ||
        currentFilters.from_sleep || currentFilters.to_sleep) && (
        <div className="container">
          <div className="active-chips-row">
            {currentFilters.make && (
              <span className={`active-chip${removingChip === "make" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleMakeOpen}>
                  {toTitleCase(
                    makeCounts.find(m => m.slug === currentFilters.make)?.name ??
                      makes.find(m => m.slug === currentFilters.make)?.name ??
                      currentFilters.make,
                  )}
                </span>
                <span className="chip-close" onClick={() => removeChip("make", { make: undefined, model: undefined })}>×</span>
              </span>
            )}
            {currentFilters.model && (
              <span className={`active-chip${removingChip === "model" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleMakeOpen}>
                  {toTitleCase(
                    lastModelName ??
                      modelCounts.find(m => m.slug === currentFilters.model)?.name ??
                      currentFilters.model.replace(/-/g," "),
                  )}
                </span>
                <span className="chip-close" onClick={() => removeChip("model", { model: undefined })}>×</span>
              </span>
            )}
            {currentFilters.engine_make && (
              <span className={`active-chip${removingChip === "engine_make" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleEngineMakeOpen}>{toTitleCase(currentFilters.engine_make.replace(/-/g, " "))}</span>
                <span className="chip-close" onClick={() => removeChip("engine_make", { engine_make: undefined })}>×</span>
              </span>
            )}
            {currentFilters.condition && (
              <span className={`active-chip${removingChip === "condition" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleConditionOpen}>{currentFilters.condition.toLowerCase() === "new" ? "New" : "Used"}</span>
                <span className="chip-close" onClick={() => removeChip("condition", { condition: undefined })}>×</span>
              </span>
            )}
            {currentFilters.state && (
              <span className={`active-chip${removingChip === "state" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleLocationOpen}>{toTitleCase(currentFilters.state.replace(/-/g, " "))}</span>
                <span className="chip-close" onClick={() => removeChip("state", { state:undefined, region:undefined, suburb:undefined, pincode:undefined, radius_kms:undefined })}>×</span>
              </span>
            )}
            {currentFilters.region && (
              <span className={`active-chip${removingChip === "region" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleLocationOpen}>{toTitleCase(currentFilters.region.replace(/-/g, " "))}</span>
                <span className="chip-close" onClick={() => removeChip("region", { region:undefined, suburb:undefined, pincode:undefined, radius_kms:undefined })}>×</span>
              </span>
            )}
            {currentFilters.suburb && (
              <span className={`active-chip${removingChip === "suburb" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleLocationOpen}>{toTitleCase(currentFilters.suburb)}</span>
                <span className="chip-close" onClick={() => removeChip("suburb", { suburb:undefined, pincode:undefined, radius_kms:undefined })}>×</span>
              </span>
            )}
            {(currentFilters.from_price || currentFilters.to_price) && (
              <span className={`active-chip${removingChip === "price" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handlePriceOpen}>
                  {currentFilters.from_price && currentFilters.to_price
                    ? `$${Number(currentFilters.from_price).toLocaleString("en-US")} – $${Number(currentFilters.to_price).toLocaleString("en-US")}`
                    : currentFilters.from_price
                      ? `From $${Number(currentFilters.from_price).toLocaleString("en-US")}`
                      : `Upto $${Number(currentFilters.to_price).toLocaleString("en-US")}`}
                </span>
                <span className="chip-close" onClick={() => removeChip("price", { from_price:undefined, to_price:undefined })}>×</span>
              </span>
            )}
            {(currentFilters.minKg || currentFilters.maxKg) && (
              <span className={`active-chip${removingChip === "gvm" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleGvmOpen}>
                  {currentFilters.minKg && currentFilters.maxKg
                    ? `${Number(currentFilters.minKg).toLocaleString("en-US")} – ${Number(currentFilters.maxKg).toLocaleString("en-US")} kg`
                    : currentFilters.minKg
                      ? `From ${Number(currentFilters.minKg).toLocaleString("en-US")} kg`
                      : `Upto ${Number(currentFilters.maxKg).toLocaleString("en-US")} kg`}
                </span>
                <span className="chip-close" onClick={() => removeChip("gvm", { minKg:undefined, maxKg:undefined })}>×</span>
              </span>
            )}
            {(currentFilters.from_sleep || currentFilters.to_sleep) && (
              <span className={`active-chip${removingChip === "sleep" ? " chip-removing" : ""}`}>
                <span className="chip-label" onClick={handleSleepOpen}>
                  {currentFilters.from_sleep && currentFilters.to_sleep
                    ? String(currentFilters.from_sleep) === String(currentFilters.to_sleep)
                      ? `${currentFilters.from_sleep} Berth`
                      : `${currentFilters.from_sleep} – ${currentFilters.to_sleep} Berths`
                    : currentFilters.from_sleep
                      ? `From ${currentFilters.from_sleep} Berths`
                      : `Upto ${currentFilters.to_sleep} Berths`}
                </span>
                <span className="chip-close" onClick={() => removeChip("sleep", { from_sleep:undefined, to_sleep:undefined })}>×</span>
              </span>
            )}
            <button className="chip-clear-all" disabled={clearingAll} onClick={handleClearAll}>
              {clearingAll ? "Clearing…" : "Clear all"}
            </button>
          </div>
        </div>
      )}

      {/* ── All Filters Combined Modal ── */}
      {openModal === "allFilters" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header"><h3>Filters</h3>{closeBtn}</div>
            <div className="filter-body">


              {/* Location */}
              <div className="filter-item">
                <h4>Location</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>State</label>
                    <select className="cfs-select-input form-select" value={tempState ?? ""}
                      onChange={e => { setTempState(e.target.value || null); setTempRegion(null); }}>
                      <option value="">Any</option>
                      {visibleStates.map(s => (
                        <option key={s.value} value={s.name}>
                          {abbrFor(s.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Region</label>
                    <select className="cfs-select-input form-select"
                      disabled={!tempState || filteredRegions.length === 0}
                      value={tempRegion ?? ""}
                      onChange={e => setTempRegion(e.target.value || null)}>
                      <option value="">Any</option>
                      {filteredRegions.map(r => (
                        <option key={r.value} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Suburb / Postcode */}
              <div className="filter-item">
                <h4>Suburb/Postcode</h4>
                <div style={{ position:"relative" }}>
                  <div className="loc-search-wrap">
                    <i className="bi bi-search loc-search-icon" />
                    <input
                      className="loc-search-input"
                      placeholder="Search suburb, postcode, state, region"
                      value={tempSuburbSuggestion && !tempSuburbInput ? tempSuburbSuggestion.address : formatted(tempSuburbInput)}
                      onFocus={() => { if (!tempSuburbSuggestion) setShowSuburbSuggestions(true); }}
                      onChange={e => {
                        setShowSuburbSuggestions(true);
                        setTempSuburbSuggestion(null);
                        const raw = e.target.value;
                        setTempSuburbInput(raw);
                        const fmt = /^\d+$/.test(raw) ? raw : formatLocationInput(raw);
                        if (fmt.length < 1) { setSuburbLocationSuggestions([]); return; }
                        if (suburbDebounceRef.current) clearTimeout(suburbDebounceRef.current);
                        suburbDebounceRef.current = setTimeout(() => {
                          const rid = ++suburbReqIdRef.current;
                          setSuburbLocLoading(true);
                          fetchLocations(fmt.split(" ")[0]).then((data: any) => {
                            if (rid !== suburbReqIdRef.current) return;
                            const sv = fmt.toLowerCase();
                            setSuburbLocationSuggestions(data.filter((x: any) =>
                              x.short_address?.toLowerCase().includes(sv) ||
                              x.address?.toLowerCase().includes(sv) ||
                              (x.postcode && x.postcode.toString().includes(sv))
                            ));
                            setSuburbLocLoading(false);
                          }).catch(() => setSuburbLocLoading(false));
                        }, 300);
                      }}
                      onBlur={() => setTimeout(() => setShowSuburbSuggestions(false), 150)}
                    />
                    {tempSuburbSuggestion && (
                      <button type="button"
                        style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:20, lineHeight:1 }}
                        onMouseDown={e => { e.preventDefault(); setTempSuburbSuggestion(null); setTempSuburbInput(""); }}>×</button>
                    )}
                  </div>
                  {showSuburbSuggestions && suburbLocLoading && tempSuburbInput && (
                    <ul className="location-suggestions">
                      {[1,2,3].map(i => <li key={i} className="suggestion-skeleton"><div className="skeleton-line" /></li>)}
                    </ul>
                  )}
                  {showSuburbSuggestions && !suburbLocLoading && tempSuburbInput && suburbLocationSuggestions.length === 0 && (
                    <p style={{ fontSize:13, color:"#888", margin:0, paddingLeft:4 }}>No results found</p>
                  )}
                  {showSuburbSuggestions && !suburbLocLoading && suburbLocationSuggestions.length > 0 && (
                    <ul className="location-suggestions">
                      {suburbLocationSuggestions.map((item: any, idx: number) => (
                        <li key={idx}
                          className={`suggestion-item${tempSuburbSuggestion?.short_address === item.short_address ? " selected" : ""}`}
                          onMouseDown={e => {
                            e.preventDefault();
                            setTempSuburbSuggestion(item);
                            setTempSuburbInput("");
                            setSuburbLocationSuggestions([]);
                            setShowSuburbSuggestions(false);
                          }}
                        >{item.address}</li>
                      ))}
                    </ul>
                  )}
                </div>
                {tempSuburbSuggestion && !tempSuburbInput && tempSuburbSuggestion.uri.split("/").filter(Boolean).length >= 3 && (
                  <div style={{ marginTop:14 }}>
                    <div className="cfs-radius-label">Search surrounding area</div>
                    <div className="cfs-radius-wrap">
                      {(() => {
                        const idx = Math.max(0, RADIUS_OPTIONS.indexOf(tempSuburbRadius as (typeof RADIUS_OPTIONS)[number]));
                        const pct = (idx / (RADIUS_OPTIONS.length - 1)) * 100;
                        return (
                          <>
                            <div className="cfs-radius-tooltip" style={{ left:`calc(${pct}% + ${18 - 0.36*pct}px)` }}>{tempSuburbRadius}km</div>
                            <div className="cfs-radius-track-wrap">
                              <input type="range" className="cfs-radius-slider" min={0} max={RADIUS_OPTIONS.length-1} step={1} value={idx}
                                style={{ background:`linear-gradient(to right,#0088c6 0%,#0088c6 ${pct}%,#ddd ${pct}%,#ddd 100%)` }}
                                onChange={e => setTempSuburbRadius(RADIUS_OPTIONS[parseInt(e.target.value,10)])} aria-label="Search radius" />
                              {RADIUS_OPTIONS.map((km,i) => {
                                const tp = (i/(RADIUS_OPTIONS.length-1))*100;
                                return <span key={i} className={`cfs-radius-tick${i<idx?" active":i===idx?" current":""}`} style={{ left:`calc(${tp}% + ${9-0.18*tp}px)` }} title={`${km}km`} />;
                              })}
                            </div>
                            <div className="cfs-radius-range"><span>{RADIUS_OPTIONS[0]}km</span><span>{RADIUS_OPTIONS[RADIUS_OPTIONS.length-1].toLocaleString("en-US")}km</span></div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Condition */}
              <div className="filter-item">
                <h4>Condition</h4>
                <ul className="loc-state-list" style={{ display:"flex", gap:20 }}>
                  {(["new","used"] as const).map(c => (
                    <li key={c} className="loc-state-item" style={{ borderBottom:"none", padding:"4px 0" }}
                      onClick={() => setTempCondition(tempCondition === c ? null : c)}>
                      <span className={`loc-checkbox${tempCondition === c ? " checked" : ""}`}>
                        {tempCondition === c && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                      </span>
                      <span className="loc-state-name">{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Make & Model */}
              <div className="filter-item">
                <h4>Make &amp; Model</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Make</label>
                    <select className="cfs-select-input form-select" value={tempMake ?? ""}
                      onChange={e => { setTempMake(e.target.value || null); setTempModel(null); }}>
                      <option value="">Any</option>
                      {makes.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Model</label>
                    <select className="cfs-select-input form-select"
                      disabled={!tempMake || modelCounts.length === 0}
                      value={tempModel ?? ""}
                      onChange={e => setTempModel(e.target.value || null)}>
                      <option value="">Any</option>
                      {modelCounts.map(mod => (
                        <option key={mod.slug} value={mod.slug}>{mod.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/*  Vehicle Make — UI scaffolding only; no backend data source
               * exists yet for engine_make. Once the API exposes an
               * engine_make grouping, replace this with a populated
               * select like the Make one above. */}
              <div className="filter-item">
                <h4> Vehicle Make</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <select className="cfs-select-input form-select" value={tempEngineMake ?? ""} disabled>
                      <option value="">Coming soon</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="filter-item">
                <h4>Price</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Min Price</label>
                    <select className="cfs-select-input form-select" value={tempPriceFrom ?? ""}
                      onChange={e => setTempPriceFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {PRICE_OPTIONS.filter(p => !tempPriceTo || p < tempPriceTo).map(p => (
                        <option key={p} value={p}>${p.toLocaleString("en-US")}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Max Price</label>
                    <select className="cfs-select-input form-select" value={tempPriceTo ?? ""}
                      onChange={e => setTempPriceTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {PRICE_OPTIONS.filter(p => !tempPriceFrom || p > tempPriceFrom).map(p => (
                        <option key={p} value={p}>${p.toLocaleString("en-US")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/*GVM */}
              <div className="filter-item">
                <h4>GVM (kg)</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>MinGVM</label>
                    <select className="cfs-select-input form-select" value={tempGvmFrom ?? ""}
                      onChange={e => setTempGvmFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {GVM_OPTIONS.filter(a => !tempGvmTo || a < tempGvmTo).map(a => (
                        <option key={a} value={a}>{a.toLocaleString("en-US")} kg</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>MaxGVM</label>
                    <select className="cfs-select-input form-select" value={tempGvmTo ?? ""}
                      onChange={e => setTempGvmTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {GVM_OPTIONS.filter(a => !tempGvmFrom || a > tempGvmFrom).map(a => (
                        <option key={a} value={a}>{a.toLocaleString("en-US")} kg</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sleeps */}
              <div className="filter-item">
                <h4>Sleeping Capacity</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Min Berths</label>
                    <select className="cfs-select-input form-select" value={tempSleepFrom ?? ""}
                      onChange={e => setTempSleepFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {SLEEP_OPTIONS.filter(s => !tempSleepTo || s < tempSleepTo).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Max Berths</label>
                    <select className="cfs-select-input form-select" value={tempSleepTo ?? ""}
                      onChange={e => setTempSleepTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {SLEEP_OPTIONS.filter(s => !tempSleepFrom || s > tempSleepFrom).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Year */}
              <div className="filter-item">
                <h4>Year</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>From</label>
                    <select className="cfs-select-input form-select" value={tempYearFrom ?? ""}
                      onChange={e => setTempYearFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {YEAR_OPTIONS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>To</label>
                    <select className="cfs-select-input form-select" value={tempYearTo ?? ""}
                      onChange={e => setTempYearTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {YEAR_OPTIONS.filter(y => !tempYearFrom || y >= tempYearFrom).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Length */}
              <div className="filter-item">
                <h4>Length</h4>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Min</label>
                    <select className="cfs-select-input form-select" value={tempLengthFrom ?? ""}
                      onChange={e => setTempLengthFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {LENGTH_OPTIONS.filter(l => !tempLengthTo || l < tempLengthTo).map(l => (
                        <option key={l} value={l}>{l} ft</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex:1, minWidth:130 }}>
                    <label style={{ fontSize:13, color:"#555", display:"block", marginBottom:6 }}>Max</label>
                    <select className="cfs-select-input form-select" value={tempLengthTo ?? ""}
                      onChange={e => setTempLengthTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {LENGTH_OPTIONS.filter(l => !tempLengthFrom || l > tempLengthFrom).map(l => (
                        <option key={l} value={l}>{l} ft</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Keyword */}
              <div className="filter-item">
                <h4>Search by Keyword</h4>
                <div style={{ position:"relative" }}>
                  <div className="loc-search-wrap">
                    <i className="bi bi-search loc-search-icon" />
                    <input
                      className="loc-search-input"
                      placeholder="e.g. ensuite, solar, slide-out..."
                      autoComplete="off"
                      value={tempKeyword}
                      onFocus={() => setShowKeywordSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowKeywordSuggestions(false), 200)}
                      onChange={e => setTempKeyword(e.target.value)}
                    />
                  </div>

                  {showKeywordSuggestions && tempKeyword.trim().length < 2 && (
                    baseLoading ? (
                      <div className="location-suggestions"><SearchSuggestionSkeleton count={4} label="Popular searches" /></div>
                    ) : baseKeywords.length > 0 ? (
                      <ul className="location-suggestions">
                        {baseKeywords.map((item, idx) => (
                          <li key={`${item.label}-${idx}`} className="suggestion-item"
                            onMouseDown={e => { e.preventDefault(); setTempKeyword(item.label); setShowKeywordSuggestions(false); }}
                          >{item.label}</li>
                        ))}
                      </ul>
                    ) : null
                  )}

                  {showKeywordSuggestions && tempKeyword.trim().length >= 2 && (
                    keywordLoading ? (
                      <div className="location-suggestions"><SearchSuggestionSkeleton count={4} label="Suggested searches" /></div>
                    ) : keywordSuggestions.length > 0 ? (
                      <ul className="location-suggestions">
                        {keywordSuggestions.map((item, idx) => (
                          <li key={`${item.label}-${idx}`} className="suggestion-item"
                            onMouseDown={e => { e.preventDefault(); setTempKeyword(item.label); setShowKeywordSuggestions(false); }}
                          >{item.label}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize:13, color:"#888", margin:0, paddingLeft:4 }}>No results found</p>
                    )
                  )}
                </div>
              </div>

            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleAllFiltersClear}>Clear filters</button>
              <button className="search active" onClick={handleAllFiltersSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Location Modal ── */}
      {openModal === "location" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header" style={{ position:"relative" }}>
              {locationSubView === "regions" ? (
                <>
                  <button className="loc-back-btn" onClick={() => setLocationSubView("states")}>
                    <i className="bi bi-chevron-left" /> Location
                  </button>
                  <h3 style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", margin:0 }}>Region</h3>
                </>
              ) : (
                <h3>Location</h3>
              )}
              {closeBtn}
            </div>
            <div className="filter-body">
              {locationSubView === "states" ? (
                <>
                  {/* Suburb search */}
                  <div className="loc-search-wrap">
                    <div style={{ position:"relative" }}>
                      <i className="bi bi-search loc-search-icon" />
                      <input
                        type="text" className="loc-search-input" autoComplete="off"
                        placeholder="Search suburb, postcode, state, region"
                        value={formatted(tempSuburbInput)}
                        onFocus={() => setShowSuburbSuggestions(true)}
                        onChange={e => {
                          setShowSuburbSuggestions(true);
                          setTempSuburbSuggestion(null);
                          const raw = e.target.value;
                          setTempSuburbInput(raw);
                          const fmt = /^\d+$/.test(raw) ? raw : formatLocationInput(raw);
                          if (fmt.length < 1) { setSuburbLocationSuggestions([]); return; }
                          if (suburbDebounceRef.current) clearTimeout(suburbDebounceRef.current);
                          suburbDebounceRef.current = setTimeout(() => {
                            const rid = ++suburbReqIdRef.current;
                            setSuburbLocLoading(true);
                            fetchLocations(fmt.split(" ")[0]).then((data: any) => {
                              if (rid !== suburbReqIdRef.current) return;
                              const sv = fmt.toLowerCase();
                              setSuburbLocationSuggestions(data.filter((x: any) =>
                                x.short_address?.toLowerCase().includes(sv) ||
                                x.address?.toLowerCase().includes(sv) ||
                                (x.postcode && x.postcode.toString().includes(sv))
                              ));
                              setSuburbLocLoading(false);
                            }).catch(() => setSuburbLocLoading(false));
                          }, 300);
                        }}
                        onBlur={() => setTimeout(() => setShowSuburbSuggestions(false), 150)}
                      />
                    </div>
                    {showSuburbSuggestions && suburbLocLoading && tempSuburbInput && (
                      <ul className="location-suggestions">
                        {[1,2,3].map(i => <li key={i} className="suggestion-skeleton"><div className="skeleton-line" /></li>)}
                      </ul>
                    )}
                    {showSuburbSuggestions && !suburbLocLoading && tempSuburbInput && suburbLocationSuggestions.length === 0 && (
                      <p className="suggestions-no-results" style={{ paddingLeft:12 }}>No results found</p>
                    )}
                    {showSuburbSuggestions && !suburbLocLoading && suburbLocationSuggestions.length > 0 && (
                      <ul className="location-suggestions">
                        {suburbLocationSuggestions.map((item: any, idx: number) => (
                          <li key={idx}
                            className={`suggestion-item${tempSuburbSuggestion?.short_address === item.short_address ? " selected" : ""}`}
                            onMouseDown={e => {
                              e.preventDefault();
                              setTempSuburbSuggestion(item);
                              setTempSuburbInput("");
                              setSuburbLocationSuggestions([]);
                              setShowSuburbSuggestions(false);
                            }}
                          >{item.address}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Selected suburb chip + radius */}
                  {tempSuburbSuggestion && !tempSuburbInput && (
                    <div style={{ marginBottom:12 }}>
                      <div className="filter-chip">
                        <span>{tempSuburbSuggestion.address}</span>
                        <button type="button" className="filter-chip-close" onMouseDown={e => { e.preventDefault(); setTempSuburbSuggestion(null); setTempSuburbInput(""); }} aria-label="Remove location">×</button>
                      </div>
                      {tempSuburbSuggestion.uri.split("/").filter(Boolean).length >= 3 && (
                        <div style={{ marginTop:14 }}>
                          <div className="cfs-radius-label">Search surrounding area</div>
                          <div className="cfs-radius-wrap">
                            {(() => {
                              const idx = Math.max(0, RADIUS_OPTIONS.indexOf(tempSuburbRadius as (typeof RADIUS_OPTIONS)[number]));
                              const pct = (idx / (RADIUS_OPTIONS.length - 1)) * 100;
                              return (
                                <>
                                  <div className="cfs-radius-tooltip" style={{ left:`calc(${pct}% + ${18 - 0.36*pct}px)` }}>{tempSuburbRadius}km</div>
                                  <div className="cfs-radius-track-wrap">
                                    <input type="range" className="cfs-radius-slider" min={0} max={RADIUS_OPTIONS.length-1} step={1} value={idx}
                                      style={{ background:`linear-gradient(to right,#0088c6 0%,#0088c6 ${pct}%,#ddd ${pct}%,#ddd 100%)` }}
                                      onChange={e => setTempSuburbRadius(RADIUS_OPTIONS[parseInt(e.target.value,10)])} aria-label="Search radius" />
                                    {RADIUS_OPTIONS.map((km,i) => {
                                      const tp = (i/(RADIUS_OPTIONS.length-1))*100;
                                      return <span key={i} className={`cfs-radius-tick${i<idx?" active":i===idx?" current":""}`} style={{ left:`calc(${tp}% + ${9-0.18*tp}px)` }} title={`${km}km`} />;
                                    })}
                                  </div>
                                  <div className="cfs-radius-range"><span>{RADIUS_OPTIONS[0]}km</span><span>{RADIUS_OPTIONS[RADIUS_OPTIONS.length-1].toLocaleString("en-US")}km</span></div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* State list */}
                  <ul className="loc-state-list" style={{ display: tempSuburbSuggestion ? "none" : undefined }}>
                    {visibleStates.map(s => {
                      const abbr = abbrFor(s.name);
                      const isSelected = tempState?.toLowerCase() === s.name.toLowerCase();
                      return (
                        <li key={s.name} className={`loc-state-item${isSelected ? " selected" : ""}`} onClick={() => { setTempState(isSelected ? null : s.name); setTempRegion(null); }}>
                          <span className={`loc-checkbox${isSelected ? " checked" : ""}`}>
                            {isSelected && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                          </span>
                          <span className="loc-state-name">{abbr}</span>
                          {isSelected ? (
                            <button className="loc-region-pill" onClick={e => { e.stopPropagation(); handleRegionViewOpen(s.name); }}>
                              Region <i className="bi bi-chevron-right" />
                            </button>
                          ) : (
                            <button className="loc-arrow-btn" onClick={e => { e.stopPropagation(); handleRegionViewOpen(s.name); }} aria-label={`View regions in ${abbr}`}>
                              <i className="bi bi-chevron-right" />
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <>
                  <div className="loc-region-heading">Region of {tempState}</div>
                  <ul className="loc-state-list">
                    {filteredRegions.map(r => {
                      const isSelected = tempRegion?.toLowerCase() === r.name.toLowerCase();
                      return (
                        <li key={r.name} className={`loc-state-item${isSelected ? " selected" : ""}`} onClick={() => setTempRegion(isSelected ? null : r.name)}>
                          <span className={`loc-checkbox${isSelected ? " checked" : ""}`}>
                            {isSelected && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                          </span>
                          <span className="loc-state-name">{r.name}</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleLocationClear} style={{ opacity:(tempState||currentFilters.suburb)?1:0.4, cursor:(tempState||currentFilters.suburb)?"pointer":"not-allowed" }}>Clear</button>
              <button className={`search${(hasLocationChange||tempSuburbSuggestion)?" active":""}`}
                onClick={() => {
                  if (tempSuburbSuggestion) {
                    const parts = tempSuburbSuggestion.uri.split("/").filter(Boolean);
                    const stateSlug  = parts[0]||"";
                    const regionSlug = parts[1]||"";
                    const suburbSlug = parts[2]||"";
                    let   pincode    = parts[3]||"";
                    const state  = stateSlug.replace(/-state$/,"").replace(/-/g," ").trim();
                    const region = regionSlug.replace(/-region$/,"").replace(/-/g," ").trim();
                    const spMatch = suburbSlug.match(/^([a-z0-9-]+)-(\d{4})-suburb$/i);
                    let suburb: string;
                    if (spMatch) { suburb = spMatch[1].replace(/-/g," ").trim(); if (!pincode) pincode = spMatch[2]; }
                    else { suburb = suburbSlug.replace(/-suburb$/,"").replace(/-/g," ").trim(); }
                    if (!/^\d{4}$/.test(pincode)) { const m = tempSuburbSuggestion.address.match(/\b\d{4}\b/); if (m) pincode = m[0]; }
                    const validRegion = getValidRegionName(state, region, states);
                    updateFiltersAndURL({ suburb:suburb.toLowerCase(), pincode:pincode||undefined, state, region:validRegion||region, radius_kms:tempSuburbRadius });
                  } else {
                    handleLocationSearch();
                  }
                  setOpenModal(null);
                }}
              >Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Make & Model Modal ── */}
      {openModal === "make" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header" style={{ position:"relative" }}>
              {makeSubView === "models" ? (
                <>
                  <button className="loc-back-btn" onClick={() => setMakeSubView("makes")}><i className="bi bi-chevron-left" /> Make</button>
                  <h3 style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", margin:0 }}>Model</h3>
                </>
              ) : <h3>Make &amp; Model</h3>}
              {closeBtn}
            </div>
            <div className="filter-search-bar">
              {makeSubView === "models" && (
                <div className="loc-region-heading" style={{ marginBottom:8, borderBottom:"none", paddingBottom:0 }}>
                  {makes.find(m => m.slug === tempMake)?.name ?? tempMake}
                </div>
              )}
              <div className="loc-search-wrap" style={{ marginBottom:0 }}>
                <i className="bi bi-search loc-search-icon" />
                <input className="loc-search-input" type="text"
                  placeholder={makeSubView === "makes" ? "Search make" : "Search model"}
                  value={makeSubView === "makes" ? makeSearch : modelSearch}
                  onChange={e => makeSubView === "makes" ? setMakeSearch(e.target.value) : setModelSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-body">
              {makeSubView === "makes" ? (
                <ul className="loc-state-list">
                  {filteredMakes.map(m => {
                    const isSelected = tempMake === m.slug;
                    return (
                      <li key={m.slug} className={`loc-state-item${isSelected ? " selected" : ""}`}
                        onClick={() => { if (isSelected) { setTempMake(null); setTempModel(null); } else { setTempMake(m.slug); setTempModel(null); } }}>
                        <span className={`loc-checkbox${isSelected ? " checked" : ""}`}>
                          {isSelected && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                        </span>
                        <span className="loc-state-name">{m.name}</span>
                        {isSelected ? (
                          <button className="loc-region-pill" onClick={e => { e.stopPropagation(); handleModelViewOpen(m.slug); }}>Model <i className="bi bi-chevron-right" /></button>
                        ) : (
                          <button className="loc-arrow-btn" onClick={e => { e.stopPropagation(); setTempMake(m.slug); setTempModel(null); handleModelViewOpen(m.slug); }} aria-label={`View models for ${m.name}`}><i className="bi bi-chevron-right" /></button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="loc-state-list">
                  {filteredModels.length === 0 ? (
                    <li className="loc-state-item" style={{ color:"#888" }}>No models found</li>
                  ) : (
                    filteredModels.map(mod => {
                      const isSelected = tempModel === mod.slug;
                      return (
                        <li key={mod.slug} className={`loc-state-item${isSelected ? " selected" : ""}`} onClick={() => setTempModel(isSelected ? null : mod.slug)}>
                          <span className={`loc-checkbox${isSelected ? " checked" : ""}`}>
                            {isSelected && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                          </span>
                          <span className="loc-state-name">{mod.name || mod.slug}</span>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleMakeClear} style={{ opacity:tempMake?1:0.4, cursor:tempMake?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${tempMake?" active":""}`} onClick={handleMakeSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ──  Vehicle Make Modal — UI scaffolding only; no backend data source
       * exists yet for engine_make, so this has no options list. Once the
       * API exposes an engine_make grouping, wire it up the same way Make
       * is wired (see makeCounts / filteredMakes above). ── */}
      {openModal === "engineMake" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header">
              <h3> Vehicle Make</h3>
              {closeBtn}
            </div>
            <div className="filter-body">
              <p style={{ color:"#888", padding:"24px 4px" }}> Vehicle Make filtering is coming soon.</p>
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleEngineMakeClear} style={{ opacity:tempEngineMake?1:0.4, cursor:tempEngineMake?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${tempEngineMake?" active":""}`} onClick={handleEngineMakeSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Price Modal ── */}
      {openModal === "price" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header"><h3>Price</h3>{closeBtn}</div>
            <div className="filter-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Min</label>
                    <select className="cfs-select-input form-select" value={tempPriceFrom ?? ""} onChange={e => setTempPriceFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {PRICE_OPTIONS.map(v => <option key={v} value={v}>${v.toLocaleString("en-US")}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Max</label>
                    <select className="cfs-select-input form-select" value={tempPriceTo ?? ""} onChange={e => setTempPriceTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {PRICE_OPTIONS.filter(v => !tempPriceFrom || v > tempPriceFrom).map(v => <option key={v} value={v}>${v.toLocaleString("en-US")}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handlePriceClear} style={{ opacity:(tempPriceFrom||tempPriceTo)?1:0.4, cursor:(tempPriceFrom||tempPriceTo)?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${(tempPriceFrom||tempPriceTo)?" active":""}`} onClick={handlePriceSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ──GVM Modal ── */}
      {openModal === "gvm" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header"><h3>GVM</h3>{closeBtn}</div>
            <div className="filter-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Min</label>
                    <select className="cfs-select-input form-select" value={tempGvmFrom ?? ""} onChange={e => setTempGvmFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {GVM_OPTIONS.map(v => <option key={v} value={v}>{v} kg</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Max</label>
                    <select className="cfs-select-input form-select" value={tempGvmTo ?? ""} onChange={e => setTempGvmTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {GVM_OPTIONS.filter(v => !tempGvmFrom || v > tempGvmFrom).map(v => <option key={v} value={v}>{v} kg</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleGvmClear} style={{ opacity:(tempGvmFrom||tempGvmTo)?1:0.4, cursor:(tempGvmFrom||tempGvmTo)?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${(tempGvmFrom||tempGvmTo)?" active":""}`} onClick={handleGvmSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Condition Modal ── */}
      {openModal === "condition" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header"><h3>Condition</h3>{closeBtn}</div>
            <div className="filter-body">
              <div className="filter-item condition-field">
                <ul className="loc-state-list">
                  {(["New","Used"] as const).map(cond => {
                    const isSelected = tempCondition?.toLowerCase() === cond.toLowerCase();
                    return (
                      <li key={cond} className="loc-state-item" onClick={() => setTempCondition(isSelected ? null : cond.toLowerCase())}>
                        <span className={`loc-checkbox${isSelected ? " checked" : ""}`}>
                          {isSelected && <i className="bi bi-check" style={{ color:"#fff", fontSize:14, lineHeight:1 }} />}
                        </span>
                        <span className="loc-state-name">{cond}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleConditionClear} style={{ opacity:tempCondition?1:0.4, cursor:tempCondition?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${tempCondition?" active":""}`} onClick={handleConditionSearch}>Search</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sleep Modal ── */}
      {openModal === "sleep" && (
        <div className="filter-overlay">
          <div className="filter-modal">
            <div className="filter-header"><h3>Sleeping Capacity</h3>{closeBtn}</div>
            <div className="filter-body">
              <div className="row">
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Min</label>
                    <select className="cfs-select-input form-select" value={tempSleepFrom ?? ""} onChange={e => setTempSleepFrom(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {SLEEP_OPTIONS.map(v => <option key={v} value={v}>{v} {v===1?"person":"people"}</option>)}
                    </select>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="location-item">
                    <label>Max</label>
                    <select className="cfs-select-input form-select" value={tempSleepTo ?? ""} onChange={e => setTempSleepTo(e.target.value ? Number(e.target.value) : null)}>
                      <option value="">Any</option>
                      {SLEEP_OPTIONS.filter(v => !tempSleepFrom || v >= tempSleepFrom).map(v => <option key={v} value={v}>{v} {v===1?"person":"people"}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="filter-footer">
              <button className="clear" onClick={handleSleepClear} style={{ opacity:(tempSleepFrom||tempSleepTo)?1:0.4, cursor:(tempSleepFrom||tempSleepTo)?"pointer":"not-allowed" }}>Clear filters</button>
              <button className={`search${(tempSleepFrom||tempSleepTo)?" active":""}`} onClick={handleSleepSearch}>Search</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
