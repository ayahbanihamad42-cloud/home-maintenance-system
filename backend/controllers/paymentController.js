export const createMockPayment = async (req, res) => {
  try {
    const { amount, technicianId, hoursRequested } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const transactionId = `mock_txn_${Date.now()}`;

    return res.status(200).json({
      success: true,
      transactionId,
      status: "paid",
      amount,
      technicianId,
      hoursRequested,
      message: "Mock payment completed successfully",
    });
  } catch (error) {
    console.error("createMockPayment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};