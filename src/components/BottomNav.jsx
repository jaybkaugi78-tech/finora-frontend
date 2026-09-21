import {
  BarChart3,
  BellRing,
  CircleDollarSign,
  Home,
  MoreHorizontal,
  ReceiptText,
  Settings,
  Target,
  WalletCards,
  X,
} from "lucide-react";

import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";


const mainLinks = [
  ["/", "Home", Home],
  [
    "/transactions",
    "Activity",
    ReceiptText,
  ],
  [
    "/budgets",
    "Budgets",
    CircleDollarSign,
  ],
  [
    "/goals",
    "Goals",
    Target,
  ],
];


const moreLinks = [
  [
    "/accounts",
    "Accounts",
    WalletCards,
  ],
  [
    "/bills",
    "Bills",
    BellRing,
  ],
  [
    "/analytics",
    "Analytics",
    BarChart3,
  ],
  [
    "/notifications",
    "Notifications",
    BellRing,
  ],
  [
    "/settings",
    "Settings",
    Settings,
  ],
];


export default function BottomNav() {
  const location = useLocation();

  const [moreOpen, setMoreOpen] =
    useState(false);


  const moreIsActive =
    moreLinks.some(
      ([to]) =>
        location.pathname === to ||
        location.pathname.startsWith(
          `${to}/`
        )
    );


  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);


  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [moreOpen]);


  return (
    <>
      {moreOpen && (
        <div
          className="mobile-more-backdrop"
          onClick={() =>
            setMoreOpen(false)
          }
        >
          <div
            className="mobile-more-sheet"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mobile-more-header">
              <div>
                <span className="eyebrow">
                  Finora
                </span>

                <h3>
                  More
                </h3>
              </div>

              <button
                type="button"
                className="mobile-more-close"
                onClick={() =>
                  setMoreOpen(false)
                }
                aria-label="Close menu"
              >
                <X size={19} />
              </button>
            </div>


            <div className="mobile-more-links">
              {moreLinks.map(
                ([to, label, Icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({
                      isActive,
                    }) =>
                      `mobile-more-link ${
                        isActive
                          ? "active"
                          : ""
                      }`
                    }
                  >
                    <div className="mobile-more-icon">
                      <Icon size={19} />
                    </div>

                    <span>
                      {label}
                    </span>
                  </NavLink>
                )
              )}
            </div>
          </div>
        </div>
      )}


      <nav
        className="bottom-nav"
        aria-label="Mobile navigation"
      >
        {mainLinks.map(
          ([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({
                isActive,
              }) =>
                `bottom-item ${
                  isActive
                    ? "active"
                    : ""
                }`
              }
            >
              <Icon size={19} />

              <span>
                {label}
              </span>
            </NavLink>
          )
        )}


        <button
          type="button"
          className={`bottom-item bottom-more-button ${
            moreIsActive ||
            moreOpen
              ? "active"
              : ""
          }`}
          onClick={() =>
            setMoreOpen(
              (current) =>
                !current
            )
          }
        >
          <MoreHorizontal
            size={19}
          />

          <span>
            More
          </span>
        </button>
      </nav>
    </>
  );
}