"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function CookieBanner() {
  const t = useTranslations("cookies");
  const {
    consent,
    isBannerVisible,
    isSettingsOpen,
    acceptAll,
    rejectAll,
    savePreferences,
    openCookieSettings,
    closeCookieSettings,
  } = useCookieConsent();

  const [analyticsEnabled, setAnalyticsEnabled] = useState(consent.categories.analytics);
  const [marketingEnabled, setMarketingEnabled] = useState(consent.categories.marketing);

  useEffect(() => {
    setAnalyticsEnabled(consent.categories.analytics);
    setMarketingEnabled(consent.categories.marketing);
  }, [consent.categories.analytics, consent.categories.marketing, isSettingsOpen]);

  return (
    <>
      {isBannerVisible ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] px-4 sm:bottom-6">
          <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t("bannerTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("bannerBody")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={rejectAll} className="sm:order-2">
                  {t("reject")}
                </Button>
                <Button variant="ghost" onClick={openCookieSettings} className="sm:order-1">
                  {t("configure")}
                </Button>
                <Button onClick={acceptAll} className="sm:order-3 bg-accent text-accent-foreground hover:opacity-90">
                  {t("acceptAll")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={isSettingsOpen} onOpenChange={(open) => (open ? openCookieSettings() : closeCookieSettings())}>
        <DialogContent className="rounded-2xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("settingsTitle")}</DialogTitle>
            <DialogDescription>
              {t("settingsDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">{t("necessaryTitle")}</Label>
                  <p className="text-xs text-muted-foreground">{t("necessaryDescription")}</p>
                </div>
                <Switch checked disabled aria-label={t("necessaryActiveAria")} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="cookies-analytics" className="text-sm font-medium text-foreground">{t("analyticsTitle")}</Label>
                  <p className="text-xs text-muted-foreground">{t("analyticsDescription")}</p>
                </div>
                <Switch
                  id="cookies-analytics"
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                  aria-label={t("analyticsToggleAria")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="cookies-marketing" className="text-sm font-medium text-foreground">{t("marketingTitle")}</Label>
                  <p className="text-xs text-muted-foreground">{t("marketingDescription")}</p>
                </div>
                <Switch
                  id="cookies-marketing"
                  checked={marketingEnabled}
                  onCheckedChange={setMarketingEnabled}
                  aria-label={t("marketingToggleAria")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={rejectAll}>
                {t("reject")}
              </Button>
              <Button type="button" variant="ghost" onClick={acceptAll}>
                {t("acceptAll")}
              </Button>
            </div>
            <Button
              type="button"
              className="bg-accent text-accent-foreground hover:opacity-90"
              onClick={() => savePreferences({ analytics: analyticsEnabled, marketing: marketingEnabled })}
            >
              {t("savePreferences")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
