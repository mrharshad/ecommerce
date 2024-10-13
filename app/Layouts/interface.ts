import { IAlert, ISearches, TPending } from "@/interfaces/userClientSide";
import { IAuthenticated } from "../redux/UserSliceInterface";
import { IAuthorizedUser } from "@/interfaces/userServerSide";

export interface IUserAppUpdate extends IAuthenticated {
  searches: ISearches[];
}

export interface INewAlert {
  info: IAlert;
  completed?: TPending;
}

export interface IAppMount {
  userData: IAuthorizedUser;
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
