"use client";
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import style from "./signUp.module.css";
import stateOfIndia from "@/static-data/stateOfIndia";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { authenticated, newAlert, newLoading } from "@/app/redux/UserSlice";
import { getDistricts } from "@/app/redux/UserApiRequest";
import { backEndServer, email as config, visitedLocal } from "@/exConfig";
import Link from "next/link";
import {
  IBirth,
  IClientResponse,
  IFirstStep,
  IFirstStepCompleted,
} from "./interface";
import { AppDispatch, IReduxStoreData } from "@/app/redux/ReduxStore";

const initialData = {
  numOfSendToken: 0,
  reTry: new Date(),
  validCode: "",
};
const SignUpComponent: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const defaultState = "Chhattisgarh";
  const { alerts, searches, districts, token } = useSelector(
    (data: IReduxStoreData) => data.user
  );

  const router = useRouter();
  const [firstStep, setFirstStep] = useState<IFirstStep>({ ...initialData });
  const [birth, setBirth] = useState<IBirth>();
  const [email, setEmail] = useState<string>("");
  const password = useRef<HTMLInputElement>(null);
  const confirmPassword = useRef<HTMLInputElement>(null);
  let { reTry, numOfSendToken } = firstStep;
  const currentYear = new Date().getFullYear();

  const stateChange = useCallback(
    (value: string) => {
      dispatch(getDistricts(value));
    },
    [dispatch]
  );

  const showWarning = (text: string): void => {
    dispatch(newAlert({ info: { type: "Message", text } }));
  };

  async function signUpFunction(formData: FormData): Promise<any> {
    if (alerts.length) return;
    if (reTry) {
      const pendingTime = new Date(reTry);
      let milliseconds = new Date().getTime() - pendingTime.getTime();
      const minutes = Math.floor(milliseconds / (1000 * 60));
      let pendingHours = Math.floor(minutes / 60);
      let pendingMinutes = minutes % 60;
      pendingHours = pendingHours < 0 ? Math.abs(pendingHours) : 0;
      pendingMinutes = pendingMinutes < 0 ? Math.abs(pendingMinutes) : 0;
      if (pendingHours || pendingMinutes) {
        return showWarning(
          `Try After ${pendingHours && `${pendingHours} hours`} ${
            pendingMinutes > 0 ? `: ${pendingMinutes} minutes` : ""
          } `
        );
      }
    }
    const passwordInput = password.current?.value;
    const confirmInput = confirmPassword.current?.value;
    if (passwordInput !== confirmInput) {
      return showWarning("Password not matching");
    }
    let mobileNo = formData.get("mobileNo") as string;
    let pinCode = formData.get("pinCode") as string;

    if (pinCode.length != 6) {
      return showWarning("Please check pinCode ");
    }

    if (mobileNo.charAt(0) === "0") {
      mobileNo = mobileNo.slice(1);
    }
    if (mobileNo.length != 10) {
      return showWarning("Please check mobile number");
    }
    const validCode = formData.get("validCode") as string;
    if (validCode && validCode === firstStep.validCode) {
      return showWarning("Enter New Verification Code");
    }
    dispatch(newLoading("Sign-Up"));

    const useData: any = {
      fName: formData.get("fName"),
      lName: formData.get("lName"),
      address: formData.get("address"),
      mobileNo,
      email,
      gender: formData.get("gender"),
      birth,
      validCode,
      password: passwordInput,
      searches,
      pinCode: formData.get("pinCode"),
      area: formData.get("area"),
      state: formData.get("state"),
      district: formData.get("district"),
    };
    const { hostname, protocol, tLD } = backEndServer;
    const request = await fetch(
      `${protocol}${hostname}${tLD}/api/user/create-account`,
      {
        method: "POST",
        body: JSON.stringify(useData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { success, text, numOfSendToken, data, token }: IClientResponse =
      await request.json();

    const showAlert = () => {
      dispatch(
        newAlert({
          info: {
            type: success ? "Success" : "Error",
            duration: "5s",
            text,
          },
          completed: "Sign-Up",
        })
      );
    };

    if (request.status == 201) {
      localStorage.removeItem("newAccount");
      localStorage.removeItem("Searches");
      const visited = JSON.parse(
        localStorage.getItem(visitedLocal) as string
      ) as Array<string>;
      if (visited[visited.length - 2] === "/product") {
        router.back();
      } else router.replace("/");
      dispatch(authenticated({ text, data, token, completed: "Sign-Up" }));
    } else {
      if (text.includes("Try After")) {
        useData.reTry = new Date(Date.now() + config.wait * 60 * 60 * 1000);
      }
      useData.numOfSendToken = numOfSendToken + 1;
      localStorage.setItem("newAccount", JSON.stringify(useData));
      setFirstStep(useData);
      showAlert();
    }
  }
  useEffect(() => {
    if (token) router.replace("/");
    const localData = localStorage.getItem("newAccount");
    const stateElement = document.getElementById("state") as HTMLInputElement;
    if (localData) {
      let data = { ...initialData };
      try {
        data = JSON.parse(localData);
      } catch {}
      const { birth, email, gender, state } = data as IFirstStepCompleted;
      setFirstStep(data);
      const element = document.getElementById(gender as string);
      if (element && element instanceof HTMLInputElement) {
        element.checked = true;
      }

      setBirth(birth);
      setEmail(email);
      stateChange(state);
      stateElement.value = state;
    } else {
      stateChange(defaultState);
      stateElement.value = defaultState;
    }
  }, [setFirstStep, setEmail, setBirth, stateChange]);

  function funcSetPassword(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target.value;
    let length = input.length;
    const inputName = e.target.name;
    if (input.includes(" ")) {
      e.target.value = input.trim();
      return showWarning("space not allow");
    }

    const match = (inputName === "confirmPassword" ? password : confirmPassword)
      .current?.value as string;

    if (match.length == 0 || length == 0) {
      e.target.style.borderColor =
        length > 7
          ? "green"
          : length > 5
          ? "yellow"
          : length > 0
          ? "red"
          : "transparent";
    } else {
      for (let i = 0; i < length; i++) {
        if (match.charAt(i) === input.charAt(i)) {
          e.target.style.borderColor = "green";
        } else {
          if (length > 0) {
            e.target.style.borderColor = "red";
          } else {
            e.target.style.borderColor = "transparent";
          }
          length = 0;
        }
      }
    }
  }

  return (
    <section className={style.section}>
      <form className={style.formContainer} action={signUpFunction}>
        <h1>Create Account</h1>
        <div className={style.container}>
          <label htmlFor="fName">First Name</label>
          <input
            className={style.manageHeight}
            defaultValue={firstStep.fName}
            required
            name="fName"
            id="fName"
            type="text"
            minLength={3}
          />
          <label htmlFor="lName">Last Name (surname)</label>
          <input
            className={style.manageHeight}
            defaultValue={firstStep.lName}
            required
            name="lName"
            id="lName"
            type="text"
            minLength={3}
          />
          <div className={style.email}>
            <label htmlFor="email">Email</label>
            <input
              defaultValue={firstStep.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                let [mail, domain] = e.target.value.split("@");
                const regex = /^[a-z0-9]+$/i;
                mail = mail.toLowerCase().trim();
                setEmail((pre) => {
                  if (mail.length > 1) {
                    if (regex.test(mail)) {
                      e.target.value = mail;
                      return mail;
                    } else {
                      e.target.value = pre;
                      return pre;
                    }
                  } else {
                    e.target.value = mail;
                    return mail;
                  }
                });
              }}
              required
              id="email"
              type="text"
            />
            <span>@gmail.com</span>
          </div>
          <div className={style.stateContainer}>
            <label htmlFor="mobileNo">Mobile Number</label>
            <label>Date Of Birth</label>

            <input
              defaultValue={firstStep.mobileNo}
              name="mobileNo"
              required
              id="mobileNo"
              type="number"
            />

            <div className={style.birth}>
              <label className={style.birthText} htmlFor="birth">
                {birth?.textType}
              </label>
              <input
                type="date"
                name="birth"
                id="birth"
                max={`${currentYear - 4}-01-01`}
                min={`${currentYear - 80}-01-01`}
                required
                defaultValue={birth?.dateType}
                onChange={(e) => {
                  const value = e.target.value;
                  const [year, month, date] = value.split("-");
                  setBirth({
                    textType: `${date}-${month}-${year}`,
                    dateType: value,
                  });
                }}
              />
            </div>

            <label htmlFor="state">State</label>
            <label htmlFor="district">District</label>
            <select
              onChange={(e) => stateChange(e.target.value)}
              className={style.area}
              name="state"
              id="state"
              required
            >
              {stateOfIndia.map((stName) => (
                <option value={stName} key={stName}>
                  {stName}
                </option>
              ))}
            </select>

            {districts.length ? (
              <select
                className={style.area}
                defaultValue={firstStep.district || districts[0]}
                name="district"
                id="district"
                required
              >
                {districts.map((disName) => (
                  <option value={disName} key={disName}>
                    {disName}
                  </option>
                ))}
              </select>
            ) : (
              <p className={style.skeleton}></p>
            )}
            <label htmlFor="pinCode">PinCode</label>
            <label htmlFor="area">Area</label>
            <input
              name="pinCode"
              defaultValue={firstStep.pinCode}
              required
              type="number"
              id="pinCode"
            />

            <input
              name="area"
              defaultValue={firstStep.area}
              required
              id="area"
              type="text"
              maxLength={20}
            />
          </div>

          <label htmlFor="address">Address</label>
          <input
            className={style.manageHeight}
            defaultValue={firstStep.address}
            name="address"
            required
            id="address"
            type="text"
            minLength={10}
          />

          <div className={style.gender}>
            <p>Gender</p>
            <label htmlFor="male">
              Male
              <input
                type="radio"
                required
                name="gender"
                id="male"
                value="male"
              />
            </label>

            <label htmlFor="female">
              Female{" "}
              <input
                type="radio"
                required
                name="gender"
                id="female"
                value="female"
              />
            </label>
          </div>
          {numOfSendToken > 0 && (
            <>
              <div className={style.checkMail}>
                <p>Check your mail inbox</p>
                <p></p>
              </div>
              <label htmlFor="password">Password</label>
              <input
                onChange={funcSetPassword}
                required
                name="password"
                id="password"
                ref={password}
                minLength={8}
                maxLength={20}
                type="password"
                placeholder="greater than 8 characters "
                className={style.password}
              />
              <label htmlFor="password">Confirm Password</label>
              <input
                onChange={funcSetPassword}
                required
                id="confirm"
                name="confirmPassword"
                ref={confirmPassword}
                minLength={8}
                maxLength={20}
                type="password"
                placeholder="greater than 8 characters "
                className={style.password}
              />
              <label className={style.verifyLabel} htmlFor="password">
                Enter 6 digit verification code
                <input
                  className={style.verifyInput}
                  name="validCode"
                  required
                  id="token"
                  minLength={6}
                  maxLength={6}
                  type="text"
                />
              </label>
            </>
          )}
        </div>
        <button id="verify" type="submit">
          {numOfSendToken > 0 ? "Sign Up" : "Sign Up"}
        </button>
        <p>
          Already have an account? <Link href="/user/login"> Login</Link>
        </p>
      </form>
    </section>
  );
};

export default SignUpComponent;
