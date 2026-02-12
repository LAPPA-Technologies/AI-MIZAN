(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/LanguageToggle.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const options = [
    {
        value: "en",
        label: "EN"
    },
    {
        value: "fr",
        label: "FR"
    },
    {
        value: "ar",
        label: "AR"
    }
];
const LanguageToggle = ()=>{
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [locale, setLocale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("en");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageToggle.useEffect": ()=>{
            const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
            if (match?.[1]) {
                const value = decodeURIComponent(match[1]);
                if (options.some({
                    "LanguageToggle.useEffect": (option)=>option.value === value
                }["LanguageToggle.useEffect"])) {
                    setLocale(value);
                }
            }
        }
    }["LanguageToggle.useEffect"], []);
    const updateLocale = (value)=>{
        document.cookie = `locale=${value}; path=/; max-age=31536000`;
        setLocale(value);
        document.documentElement.lang = value;
        document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
        window.dispatchEvent(new Event("locale-change"));
        router.refresh();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs",
        children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>updateLocale(option.value),
                className: `rounded-full px-3 py-1 font-semibold ${locale === option.value ? "bg-emerald-600 text-white" : "text-slate-600"}`,
                children: option.label
            }, option.value, false, {
                fileName: "[project]/components/LanguageToggle.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/components/LanguageToggle.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(LanguageToggle, "7E5Vr8E8g3HBM6XaeJJFClTt524=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LanguageToggle;
const __TURBOPACK__default__export__ = LanguageToggle;
var _c;
__turbopack_context__.k.register(_c, "LanguageToggle");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_LanguageToggle_tsx_21660afa._.js.map