import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  CircleUserRound,
  Coins,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  apiFetch,
  clearSession,
} from "../services/api";


const INITIAL_PROFILE = {
  full_name: "",
  email: "",
  currency: "KES",
  country: "Kenya",
  timezone: "Africa/Nairobi",
};


const INITIAL_PASSWORD = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};


export default function Settings() {
  const navigate =
    useNavigate();

  const [
    profile,
    setProfile,
  ] = useState(
    INITIAL_PROFILE
  );

  const [
    passwordForm,
    setPasswordForm,
  ] = useState(
    INITIAL_PASSWORD
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    savingPassword,
    setSavingPassword,
  ] = useState(false);

  const [
    profileMessage,
    setProfileMessage,
  ] = useState("");

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    profileError,
    setProfileError,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);

        const {
          user,
        } = await apiFetch(
          "/users/me"
        );

        setProfile({
          full_name:
            user.full_name || "",

          email:
            user.email || "",

          currency:
            user.currency || "KES",

          country:
            user.country || "Kenya",

          timezone:
            user.timezone ||
            "Africa/Nairobi",
        });

      } catch (error) {
        setProfileError(
          error.message
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);


  function updateProfile(
    field,
    value
  ) {
    setProfile(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setProfileMessage("");
    setProfileError("");
  }


  function updatePassword(
    field,
    value
  ) {
    setPasswordForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setPasswordMessage("");
    setPasswordError("");
  }


  async function saveProfile(
    event
  ) {
    event.preventDefault();

    try {
      setSavingProfile(true);

      setProfileError("");
      setProfileMessage("");

      const {
        user,
        message,
      } = await apiFetch(
        "/users/me",
        {
          method: "PATCH",

          body:
            JSON.stringify(
              profile
            ),
        }
      );

      setProfile({
        full_name:
          user.full_name || "",

        email:
          user.email || "",

        currency:
          user.currency || "KES",

        country:
          user.country || "Kenya",

        timezone:
          user.timezone ||
          "Africa/Nairobi",
      });

      localStorage.setItem(
        "finora_user",
        JSON.stringify(user)
      );

      setProfileMessage(
        message ||
        "Settings updated."
      );

    } catch (error) {
      setProfileError(
        error.message
      );
    } finally {
      setSavingProfile(false);
    }
  }


  async function changePassword(
    event
  ) {
    event.preventDefault();

    if (
      passwordForm.new_password
      !==
      passwordForm.confirm_password
    ) {
      setPasswordError(
        "New passwords do not match."
      );

      return;
    }

    try {
      setSavingPassword(true);

      setPasswordError("");
      setPasswordMessage("");

      const {
        message,
      } = await apiFetch(
        "/users/me/password",
        {
          method: "PATCH",

          body:
            JSON.stringify(
              passwordForm
            ),
        }
      );

      setPasswordForm(
        INITIAL_PASSWORD
      );

      setPasswordMessage(
        message ||
        "Password changed successfully."
      );

    } catch (error) {
      setPasswordError(
        error.message
      );
    } finally {
      setSavingPassword(false);
    }
  }


  function signOut() {
    clearSession();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }


  if (loading) {
    return (
      <div className="loading-state">
        Loading settings...
      </div>
    );
  }


  return (
    <div className="page-content">

      <section className="page-heading">

        <div>
          <span className="eyebrow">
            Your Finora account
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile,
            preferences and security.
          </p>
        </div>

      </section>


      <div className="settings-layout">

        <div className="settings-main">

          <section className="panel settings-section">

            <div className="settings-section-heading">

              <div className="settings-heading-icon">
                <CircleUserRound
                  size={20}
                />
              </div>

              <div>
                <h3>
                  Personal information
                </h3>

                <p>
                  Update the information
                  attached to your Finora
                  account.
                </p>
              </div>

            </div>


            {profileError && (
              <div className="auth-error">
                {profileError}
              </div>
            )}


            {profileMessage && (
              <div className="settings-success">
                <CheckCircle2
                  size={16}
                />

                {profileMessage}
              </div>
            )}


            <form
              onSubmit={
                saveProfile
              }
            >

              <div className="form-grid">

                <label>
                  Full name

                  <div className="settings-input-wrap">

                    <CircleUserRound
                      size={16}
                    />

                    <input
                      type="text"
                      value={
                        profile.full_name
                      }
                      onChange={(e) =>
                        updateProfile(
                          "full_name",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>
                </label>


                <label>
                  Email address

                  <div className="settings-input-wrap">

                    <Mail
                      size={16}
                    />

                    <input
                      type="email"
                      value={
                        profile.email
                      }
                      onChange={(e) =>
                        updateProfile(
                          "email",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>
                </label>

              </div>


              <div className="settings-subheading">
                <Globe2
                  size={17}
                />

                Financial preferences
              </div>


              <div className="form-grid">

                <label>
                  Currency

                  <div className="settings-input-wrap">

                    <Coins
                      size={16}
                    />

                    <select
                      value={
                        profile.currency
                      }
                      onChange={(e) =>
                        updateProfile(
                          "currency",
                          e.target.value
                        )
                      }
                    >
                      <option value="KES">
                        KES — Kenyan Shilling
                      </option>

                      <option value="USD">
                        USD — US Dollar
                      </option>

                      <option value="GBP">
                        GBP — British Pound
                      </option>

                      <option value="EUR">
                        EUR — Euro
                      </option>
                    </select>

                  </div>
                </label>


                <label>
                  Country

                  <div className="settings-input-wrap">

                    <MapPin
                      size={16}
                    />

                    <input
                      type="text"
                      value={
                        profile.country
                      }
                      onChange={(e) =>
                        updateProfile(
                          "country",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>
                </label>


                <label>
                  Timezone

                  <div className="settings-input-wrap">

                    <Globe2
                      size={16}
                    />

                    <select
                      value={
                        profile.timezone
                      }
                      onChange={(e) =>
                        updateProfile(
                          "timezone",
                          e.target.value
                        )
                      }
                    >
                      <option value="Africa/Nairobi">
                        Africa/Nairobi
                      </option>

                      <option value="UTC">
                        UTC
                      </option>

                      <option value="Europe/London">
                        Europe/London
                      </option>

                      <option value="America/New_York">
                        America/New_York
                      </option>

                      <option value="Asia/Dubai">
                        Asia/Dubai
                      </option>
                    </select>

                  </div>
                </label>

              </div>


              <div className="settings-form-actions">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingProfile
                  }
                >

                  {savingProfile ? (
                    <Loader2
                      size={17}
                      className="settings-spinner"
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {savingProfile
                    ? "Saving..."
                    : "Save changes"}

                </button>

              </div>

            </form>

          </section>


          <section className="panel settings-section">

            <div className="settings-section-heading">

              <div className="settings-heading-icon">
                <LockKeyhole
                  size={20}
                />
              </div>

              <div>
                <h3>
                  Password & security
                </h3>

                <p>
                  Change your password
                  using your current
                  password for verification.
                </p>
              </div>

            </div>


            {passwordError && (
              <div className="auth-error">
                {passwordError}
              </div>
            )}


            {passwordMessage && (
              <div className="settings-success">
                <CheckCircle2
                  size={16}
                />

                {passwordMessage}
              </div>
            )}


            <form
              onSubmit={
                changePassword
              }
            >

              <div className="form-grid">

                <label>
                  Current password

                  <div className="settings-input-wrap">

                    <KeyRound
                      size={16}
                    />

                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        passwordForm.current_password
                      }
                      onChange={(e) =>
                        updatePassword(
                          "current_password",
                          e.target.value
                        )
                      }
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="settings-password-toggle"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) =>
                            !value
                        )
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff
                          size={16}
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}
                    </button>

                  </div>
                </label>


                <label>
                  New password

                  <div className="settings-input-wrap">

                    <LockKeyhole
                      size={16}
                    />

                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        passwordForm.new_password
                      }
                      onChange={(e) =>
                        updatePassword(
                          "new_password",
                          e.target.value
                        )
                      }
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="settings-password-toggle"
                      onClick={() =>
                        setShowNewPassword(
                          (value) =>
                            !value
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff
                          size={16}
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}
                    </button>

                  </div>
                </label>


                <label>
                  Confirm new password

                  <div className="settings-input-wrap">

                    <ShieldCheck
                      size={16}
                    />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        passwordForm.confirm_password
                      }
                      onChange={(e) =>
                        updatePassword(
                          "confirm_password",
                          e.target.value
                        )
                      }
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="settings-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff
                          size={16}
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}
                    </button>

                  </div>
                </label>

              </div>


              <div className="settings-form-actions">

                <button
                  type="submit"
                  className="secondary-button"
                  disabled={
                    savingPassword
                  }
                >

                  {savingPassword ? (
                    <Loader2
                      size={17}
                      className="settings-spinner"
                    />
                  ) : (
                    <KeyRound
                      size={17}
                    />
                  )}

                  {savingPassword
                    ? "Updating..."
                    : "Change password"}

                </button>

              </div>

            </form>

          </section>

        </div>


        <aside className="settings-sidebar">

          <section className="panel settings-account-card">

            <div className="settings-account-avatar">
              {profile.full_name
                ?.charAt(0)
                ?.toUpperCase() ||
                "F"}
            </div>

            <strong>
              {profile.full_name}
            </strong>

            <span>
              {profile.email}
            </span>


            <div className="settings-account-details">

              <div>
                <span>
                  Currency
                </span>

                <strong>
                  {profile.currency}
                </strong>
              </div>

              <div>
                <span>
                  Country
                </span>

                <strong>
                  {profile.country}
                </strong>
              </div>

            </div>

          </section>


          <section className="panel settings-session-card">

            <div className="settings-section-heading compact">

              <div className="settings-heading-icon">
                <ShieldCheck
                  size={18}
                />
              </div>

              <div>
                <h3>
                  Session
                </h3>

                <p>
                  Manage your current
                  Finora session.
                </p>
              </div>

            </div>


            <button
              type="button"
              className="secondary-button settings-signout"
              onClick={
                signOut
              }
            >
              <LogOut
                size={17}
              />

              Sign out
            </button>

          </section>

        </aside>

      </div>

    </div>
  );
}