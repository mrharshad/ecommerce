import { IFetchKeyProductRes } from "./../../../redux/UserApiRequestInterface";

export async function PUT() {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: [],
        resPage: 1,
        key: "",
        isSearched: false,
        message: "",
        status: 200,
      } as IFetchKeyProductRes),
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          success: true,
          message: error.message,
        }),
        {
          status: 200,
        }
      );
    }
  }
}
