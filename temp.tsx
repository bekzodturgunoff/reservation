import {useState, useRef, useEffect} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAuthStore} from "../../store/authStore";
import {useToastStore} from "../../store/toastStore";
import {useThemeStore} from "../../store/themeStore";
import {useQuery} from "@tanstack/react-query";
import {getCategories} from "../../api/categories";
import {supabase} from "../../lib/supabase";
import {queryKeys} from "../../lib/queryKeys";

const Navbar = () => {
  const {t, i18n} = useTranslation();
  const {user, profile, logout} = useAuthStore();
  const {addToast} = useToastStore();
  const {theme, setTheme} = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [catOpen, setCatOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const {data: categories = []} = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))
        setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    addToast({type: "success", message: "Chiqildi"});
    navigate("/");
  };

  const langs = [
    {code: "uz", label: "O'Z"},
    {code: "ru", label: "RU"},
    {code: "en", label: "EN"},
  ];

  const themes = [
    {value: "light", label: "☀"},
    {value: "dark", label: "☾"},
    {value: "system", label: "⊙"},
  ];

  return (
    <>
      <nav className="h-16 sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-2 sm:gap-6">
          <Link
            to="/"
            className="no-underline flex items-center gap-0.5 shrink-0">
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--color-brand)",
                letterSpacing: "-0.03em",
              }}>
              Bron
            </span>
            <span
              style={{
                fontFamily: "Geist, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
              }}>
              Uz
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1" style={{flex: 1}}>
            <div ref={catRef} style={{position: "relative"}}>
              <button
                onClick={() => setCatOpen(!catOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: catOpen
                    ? "var(--color-brand)"
                    : "var(--color-text-secondary)",
                  transition: "color 150ms, background 150ms",
                }}
                onMouseEnter={(e) => {
                  if (!catOpen)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  if (!catOpen)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "none";
                }}>
                {t("nav.categories", "Kategoriyalar")}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    transform: catOpen ? "rotate(180deg)" : "none",
                    transition: "transform 200ms",
                  }}>
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {catOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    padding: "8px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "2px",
                    width: "320px",
                    zIndex: 100,
                  }}>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/search?category=${cat.slug}`}
                      onClick={() => setCatOpen(false)}
                      style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--color-text-primary)",
                        transition: "background 150ms",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLAnchorElement
                        ).style.background = "var(--color-bg)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLAnchorElement
                        ).style.background = "none")
                      }>
                      <span style={{fontSize: "16px"}}>{cat.icon}</span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {i18n.language === "uz" ? cat.name_uz : cat.name_ru}
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/search"
                    onClick={() => setCatOpen(false)}
                    style={{
                      textDecoration: "none",
                      gridColumn: "1 / -1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      marginTop: "4px",
                      borderTop: "1px solid var(--color-border)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-brand)",
                      letterSpacing: "0.04em",
                    }}>
                    BARCHASINI KO'RISH →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--color-bg)",
                borderRadius: "8px",
                padding: "2px",
                gap: "1px",
              }}
              className="hidden md:flex">
              {langs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    i18n.changeLanguage(l.code);
                    localStorage.setItem("lang", l.code);
                  }}
                  style={{
                    background:
                      i18n.language === l.code
                        ? "var(--color-surface)"
                        : "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color:
                      i18n.language === l.code
                        ? "var(--color-text-primary)"
                        : "var(--color-text-tertiary)",
                    transition: "all 150ms",
                    boxShadow:
                      i18n.language === l.code
                        ? "0 1px 2px rgba(0,0,0,0.08)"
                        : "none",
                  }}>
                  {l.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--color-bg)",
                borderRadius: "8px",
                padding: "2px",
                gap: "1px",
              }}
              className="hidden md:flex">
              {themes.map((th) => (
                <button
                  key={th.value}
                  onClick={() =>
                    setTheme(th.value as "light" | "dark" | "system")
                  }
                  style={{
                    background:
                      theme === th.value ? "var(--color-surface)" : "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color:
                      theme === th.value
                        ? "var(--color-text-primary)"
                        : "var(--color-text-tertiary)",
                    transition: "all 150ms",
                    boxShadow:
                      theme === th.value
                        ? "0 1px 2px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                  title={th.value}>
                  {th.label}
                </button>
              ))}
            </div>

            {user && profile ? (
              <div ref={userRef} style={{position: "relative"}}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    padding: "6px 10px 6px 6px",
                    cursor: "pointer",
                    transition: "border-color 150ms",
                  }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--color-brand-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--color-brand)",
                      flexShrink: 0,
                    }}>
                    {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span
                    className="hidden sm:block"
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {profile.full_name?.split(" ")[0]}
                  </span>
                  {(profile.total_points ?? 0) > 0 && (
                    <span
                      style={{
                        background: "var(--color-brand-light)",
                        color: "var(--color-brand)",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "99px",
                      }}>
                      {profile.total_points}⭐
                    </span>
                  )}
                </button>

                {userOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "14px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      minWidth: "220px",
                      zIndex: 100,
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--color-border)",
                      }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          margin: 0,
                        }}>
                        {profile.full_name}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-tertiary)",
                          margin: "2px 0 0",
                        }}>
                        {profile.role}
                      </p>
                    </div>
                    {[
                      {to: "/profile", label: t("nav.profile", "Profil")},
                      ...(profile.role === "business" ||
                      profile.role === "admin"
                        ? [
                            {
                              to: "/business/dashboard",
                              label: t("nav.business", "Biznes panel"),
                            },
                          ]
                        : []),
                      ...(profile.role === "admin"
                        ? [{to: "/admin", label: t("nav.admin", "Admin panel")}]
                        : []),
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 16px",
                          fontSize: "13px",
                          color: "var(--color-text-primary)",
                          textDecoration: "none",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "var(--color-bg)")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "none")
                        }>
                        {item.label}
                      </Link>
                    ))}
                    <div style={{borderTop: "1px solid var(--color-border)"}}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          background: "none",
                          border: "none",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "13px",
                          color: "var(--color-danger)",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "var(--color-danger-light)")
                        }
                        onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "none")
                        }>
                        {t("common.logout", "Chiqish")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block"
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "color 150ms",
                  }}>
                  {t("common.login")}
                </Link>
                <Link
                  to="/register"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "white",
                    background: "var(--color-brand)",
                    textDecoration: "none",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    transition: "background 150ms",
                  }}>
                  {t("common.register")}
                </Link>
              </div>
            )}

            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "7px",
                cursor: "pointer",
                color: "var(--color-text-primary)",
              }}>
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 2l14 14M16 2L2 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 5h14M2 9h14M2 13h14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => setMobileOpen(false)}>
          <div
            style={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              background: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
              padding: "16px 24px 24px",
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{display: "flex", gap: "8px", marginBottom: "16px"}}>
              <div
                style={{
                  display: "flex",
                  background: "var(--color-bg)",
                  borderRadius: "8px",
                  padding: "2px",
                  gap: "1px",
                }}>
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      i18n.changeLanguage(l.code);
                      localStorage.setItem("lang", l.code);
                    }}
                    style={{
                      background:
                        i18n.language === l.code
                          ? "var(--color-surface)"
                          : "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color:
                        i18n.language === l.code
                          ? "var(--color-text-primary)"
                          : "var(--color-text-tertiary)",
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  background: "var(--color-bg)",
                  borderRadius: "8px",
                  padding: "2px",
                  gap: "1px",
                }}>
                {themes.map((th) => (
                  <button
                    key={th.value}
                    onClick={() =>
                      setTheme(th.value as "light" | "dark" | "system")
                    }
                    style={{
                      background:
                        theme === th.value ? "var(--color-surface)" : "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color:
                        theme === th.value
                          ? "var(--color-text-primary)"
                          : "var(--color-text-tertiary)",
                    }}>
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-tertiary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
              Kategoriyalar
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                marginBottom: "16px",
              }}>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/search?category=${cat.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    textDecoration: "none",
                    background: "var(--color-bg)",
                    fontSize: "13px",
                    color: "var(--color-text-primary)",
                  }}>
                  <span>{cat.icon}</span>
                  <span>
                    {i18n.language === "uz" ? cat.name_uz : cat.name_ru}
                  </span>
                </Link>
              ))}
            </div>

            {!user && (
              <div style={{display: "flex", gap: "8px"}}>
                <Link
                  to="/login"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}>
                  {t("common.login")}
                </Link>
                <Link
                  to="/register"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "var(--color-brand)",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "white",
                  }}>
                  {t("common.register")}
                </Link>
              </div>
            )}
            {user && (
              <div
                style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                {[
                  {to: "/profile", label: t("nav.profile", "Profil")},
                  ...(profile?.role === "business" || profile?.role === "admin"
                    ? [{to: "/business/dashboard", label: "Biznes panel"}]
                    : []),
                  ...(profile?.role === "admin"
                    ? [{to: "/admin", label: "Admin panel"}]
                    : []),
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "var(--color-bg)",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "var(--color-danger-light)",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--color-danger)",
                    marginTop: "4px",
                  }}>
                  {t("common.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
