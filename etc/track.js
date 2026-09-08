(async function logToDiscord() {
  // 1. 로컬 개발 환경 제외
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:"
  ) {
    return;
  }

  // 2. 세션 내 중복 전송 방지 (필요 시 주석 해제)
  // if (sessionStorage.getItem("discord_logged")) {
  //   return;
  // }

  // ⚠️ Vercel 배포 후 발급받은 실제 API 주소로 수정해주세요.
  const VERCEL_DISCORD_API_URL =
    "https://changhee-cho-github-io.vercel.app/api/log-visitor";

  try {
    // 3. IP 및 위치 정보 수집
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    // 4. Vercel 중계 API로 데이터 전달 (웹훅 URL은 Vercel 내부에서 처리)
    await fetch(VERCEL_DISCORD_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ip: data.ip || "Unknown",
        country_name: data.country_name || "Unknown",
        country_code: data.country_code || "-",
        region: data.region || "",
        city: data.city || "",
        org: data.org || "알 수 없음",
        referrer: document.referrer || "직접 접속 (URL 입력 / 북마크)",
        userAgent: navigator.userAgent,
      }),
    });

    sessionStorage.setItem("discord_logged", "true");
  } catch (error) {
    console.error("Discord 알림 전송 실패:", error);
  }
})();
