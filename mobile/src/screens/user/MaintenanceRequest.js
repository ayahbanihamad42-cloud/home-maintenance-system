const [rawDateOptions, setRawDateOptions] = useState([]);

useEffect(() => {
  const generateDates = async () => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // فحص الـ 45 يوماً القادمة
    for (let i = 0; i < 45; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      try {
        // التأكد من وجود أوقات متاحة لهذا اليوم عبر الـ API
        const res = await API.get(`/technicians/${selectedTechnicianId}/availability`, {
          params: { date: value },
        });
        const list = Array.isArray(res.data) ? res.data : (res.data?.availability || []);
        const hasTimes = list.some(x => !isBooked(x));
        
        if (hasTimes) {
          result.push({ label: value, value });
        }
      } catch (err) {
        console.log("Error checking date", value, err);
      }
    }
    setRawDateOptions(result);
  };

  if (selectedTechnicianId) {
    generateDates();
  }
}, [selectedTechnicianId]);

const dateOptions = useMemo(() => {
  if (rawDateOptions.length === 0) {
    return [{ label: t("request.noAvailableDates"), value: "" }];
  }
  return rawDateOptions;
}, [rawDateOptions, t]);
