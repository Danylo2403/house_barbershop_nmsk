import { startNotifyCron } from "./notify.cron.js";

export function startCrons() {
  startNotifyCron();
}
