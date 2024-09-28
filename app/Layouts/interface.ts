import {
  IAlert,
  IReduxUserData,
  ISearches,
  TPending,
} from "@/interfaces/userClientSide";

export interface IUserAppUpdate extends IReduxUserData {
  searches: ISearches[];
}

export interface INewAlert {
  info: IAlert;
  completed?: TPending;
}

export interface IAppMount {
  userData: IReduxUserData;
  initialToken: string | null;
}
export interface HeaderProps extends IAppMount {
  // Link: typeof Link;
  // Image: FC<{
  //   src: string | StaticImageData;
  //   width: number;
  //   height: number;
  //   alt: string;
  // }>;
}

export interface IUserAlert {
  alerts: IAlert[];
  removeAlert: (text: string) => void;
  loading: Array<TPending>;
}
