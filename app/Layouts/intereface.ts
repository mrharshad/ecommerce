import { IAlert, IReduxUserData, ISearches } from "@/interfaces/userClientSide";

export interface IUserAppUpdate extends IReduxUserData {
  searches: ISearches[];
}

export interface INewAlert {
  info: IAlert;
  loading?: boolean;
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
