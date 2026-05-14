(async (): Promise<void> => {
  try {
    const res: Response = await fetch("http://194.146.12.71:8008/api/contacts");
    console.log("Status:", res.status);
    const text: string = await res.text();
    console.log("Response:", text.substring(0, 300));
  } catch (e: unknown) {
    if (e instanceof Error) {
       console.error(e.message);
    } else {
       console.error("An unknown error occurred", e);
    }
  }
})();
