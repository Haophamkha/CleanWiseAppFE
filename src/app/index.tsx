import { ROUTES } from "@/config/constants";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href={ROUTES.HOME} />;
}
