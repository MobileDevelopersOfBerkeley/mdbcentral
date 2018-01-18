// DEPENDENCIES
const router = require("express").Router();
const util = require("../../util/util.js");
const helper = require("../helper.js");
const finReportLogic = require("../../logic/FinReports.js");

// METHODS
router.get("/financial", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  helper.genData("financial", member).then(function(data) {
    return finReportLogic.getAll().then(function(reports) {
      data.reports = reports;
      data.categories = [
        "Contract", "Membership Dues", "Retreat",
        "Food", "Events", "Reimbursements", "Other"
      ];
      var totalSpending = {};
      var totalIncome = {};
      var spending = [];
      var futureSpending = [];
      var projSpending = [];
      var balance = [];
      data.categories.forEach(function(category) {
        totalSpending[category] = 0;
        totalIncome[category] = 0;
      });
      var today = new Date();
      var balanceTotal = 0;
      data.reports.sort(function(a, b) {
        var tsA = new Date(a.date).getTime();
        var tsB = new Date(b.date).getTime();
        return tsA - tsB;
      }).forEach(function(report) {
        var y = report.dollars;
        var date = new Date(report.date);
        var cat = report.category;
        var ts = date.getTime();
        var x = util.timeToString(ts);
        if (ts > today.getTime() && _differentDay(date, today) &&
          y < 0) {
          futureSpending.push([x, y]);
        } else {
          if (y > 0)
            totalIncome[cat] += y;
          else if (y < 0) {
            totalSpending[cat] += y * -1;
            spending.push([x, y]);
            projSpending.push([ts, y]);
          }
          balanceTotal += y;
          balance.push([x, balanceTotal]);
        }
      });
      balance = util.aggregateByX(balance);
      spending = util.aggregateByX(spending);
      futureSpending = util.aggregateByX(futureSpending);
      projSpending = util.aggregateByX(projSpending);
      var d = util.genPieData(totalSpending);
      data.graphs.push({
        elementId: "category_spending_graph",
        type: "pie",
        xData: d[0],
        yData: d[1]
      });
      d = util.genPieData(totalIncome);
      data.graphs.push({
        elementId: "category_income_graph",
        type: "pie",
        xData: d[0],
        yData: d[1]
      });
      d = util.formatLineData(spending);
      data.graphs.push({
        elementId: "spending_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      });
      d = util.formatLineData(futureSpending);
      data.graphs.push({
        elementId: "future_spending_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      });
      d = util.formatLineData(balance);
      data.graphs.push({
        elementId: "balance_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      });
      d = util.getProjectedPoints(projSpending, 2);
      d = util.formatLineData(d);
      d[0] = d[0].map(function(point) {
        return util.timeToString(point);
      });
      data.graphs.push({
        elementId: "proj_spending_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      })
      res.render("index", data);
    });
  });
});

// EXPORTS
module.exports = router;
