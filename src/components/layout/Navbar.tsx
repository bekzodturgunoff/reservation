import {useState, useEffect, useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarDaysIcon,
  ArrowRightStartOnRectangleIcon,
  RectangleGroupIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "../../store/authStore";
import {useToastStore} from "../../store/toastStore";
import {supabase} from "../../lib/supabase";

const Navbar = () => {
  const {t, i18n} = useTranslation();
  const {user, profile, logout} = useAuthStore();
  const {addToast} = useToastStore();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleLang = () => {
    const next = i18n.language === "uz" ? "ru" : "uz";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    addToast({type: "success", message: "Logged out successfully"});
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  const categories = [
    {slug: "cafe", label: "☕ Kafe"},
    {slug: "restaurant", label: "🍽️ Restoran"},
    {slug: "football", label: "⚽ Futbol"},
    {slug: "gaming", label: "🎮 Gaming"},
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={closeMobile}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              BronUz
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-emerald-600 transition-colors px-1.5 sm:px-2 py-1 rounded-md hover:bg-gray-100">
              <GlobeAltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="uppercase font-medium text-xs sm:text-sm">
                {i18n.language}
              </span>
            </button>

            {user && profile ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-700 hover:text-emerald-600 transition-colors px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                    {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate">
                    {profile.full_name}
                  </span>
                  <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setUserMenuOpen(false);
                        closeMobile();
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <UserIcon className="w-4 h-4" /> {t("nav.profile")}
                    </Link>
                    {(profile.role === "business" ||
                      profile.role === "admin") && (
                      <Link
                        to="/business/dashboard"
                        onClick={() => {
                          setUserMenuOpen(false);
                          closeMobile();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <RectangleGroupIcon className="w-4 h-4" />{" "}
                        {t("nav.businessPanel")}
                      </Link>
                    )}
                    {profile.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => {
                          setUserMenuOpen(false);
                          closeMobile();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <RectangleGroupIcon className="w-4 h-4" />{" "}
                        {t("nav.adminPanel")}
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4" />{" "}
                      {t("common.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex text-sm text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {t("common.login")}
                </Link>
                <Link
                  to="/login"
                  className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  title={t("common.login")}>
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  {t("common.register")}
                </Link>
                <Link
                  to="/register"
                  className="sm:hidden p-2 rounded-lg bg-emerald-600 text-white"
                  title={t("common.register")}>
                  <UserPlusIcon className="w-4 h-4" />
                </Link>
              </>
            )}

            <button
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu">
              {mobileOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Bars3Icon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-14 sm:top-16 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={closeMobile} />
          <div className="relative bg-white h-full overflow-y-auto shadow-xl pb-8">
            <div className="px-4 py-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                {t("nav.categories")}
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/search?category=${cat.slug}`}
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-xl">
                  <span className="text-lg">{cat.label.split(" ")[0]}</span>
                  <span>{cat.label.replace(/^[^\s]+\s/, "")}</span>
                </Link>
              ))}
            </div>

            <hr className="mx-4 border-gray-100" />

            {user && profile ? (
              <div className="px-4 py-4 space-y-1">
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                    {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {profile.role}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-xl">
                  <UserIcon className="w-4 h-4 text-gray-400" />{" "}
                  {t("nav.profile")}
                </Link>
                {(profile.role === "business" || profile.role === "admin") && (
                  <Link
                    to="/business/dashboard"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-xl">
                    <RectangleGroupIcon className="w-4 h-4 text-gray-400" />{" "}
                    {t("nav.businessPanel")}
                  </Link>
                )}
                {profile.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-xl">
                    <RectangleGroupIcon className="w-4 h-4 text-gray-400" />{" "}
                    {t("nav.adminPanel")}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl">
                  <ArrowRightStartOnRectangleIcon className="w-4 h-4" />{" "}
                  {t("common.logout")}
                </button>
              </div>
            ) : (
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />{" "}
                  {t("common.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700">
                  <UserPlusIcon className="w-4 h-4" /> {t("common.register")}
                </Link>
              </div>
            )}

            <hr className="mx-4 border-gray-100" />

            <div className="px-4 py-4">
              <button
                onClick={() => {
                  toggleLang();
                  closeMobile();
                }}
                className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl w-full">
                <GlobeAltIcon className="w-4 h-4" />
                {i18n.language === "uz"
                  ? "Switch to Russian"
                  : "O'zbek tiliga o'tish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
