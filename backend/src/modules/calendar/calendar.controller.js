const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const calendarService = require("./calendar.service");

const getCalendarFeed = asyncHandler(async (req, res) => {
  const result = await calendarService.getCalendarEvents(req.query, req.user);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Calendar feed fetched successfully"));
});

module.exports = {
  getCalendarFeed,
};
