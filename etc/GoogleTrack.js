(async function logToGoogleSheets() {
  // 로컬 개발 환경 제외
  if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.protocol === "file:"
  ) {
    return;
  }

  // 중복 기록 방지 (동일 세션 내 1회만 기록)
  // 현재는 주석처리 되었음 추후 중복 처리 방지 필요시 주석 제거
  //   if (sessionStorage.getItem("gsheet_logged")) {
  //     return;
  //   }

  try {
    // 1. 방문자 IP 및 위치 정보 수집
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const visitorLog = {
      timestamp: new Date().toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
      ip: data.ip || "Unknown",
      location: `${data.country_name || "Unknown"} (${data.country_code || "-"}) - ${data.region || ""}, ${data.city || ""}`,
      org: data.org || "알 수 없음",
      referrer: document.referrer
        ? document.referrer
        : "직접 접속 (URL 입력 / 북마크)",
      userAgent: navigator.userAgent,
    };

    // 2. Google Apps Script Web App 엔드포인트
    const GOOGLE_SHEET_URL =
      "https://script.google.com/macros/s/AKfycbwbfRgVMYygWzZiXdO5RE5Yey6K3sP4sVr4aM5L5_kjyOxGQHzyZ9py9mXUAFCj0xN1/exec";

    // 3. Google Sheets에 데이터 전송 (CORS 우회를 위해 mode: 'no-cors' 및 text/plain 사용)
    await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(visitorLog),
    });

    sessionStorage.setItem("gsheet_logged", "true");
  } catch (error) {
    console.error("Google Sheets 로깅 실패:", error);
  }
})();
