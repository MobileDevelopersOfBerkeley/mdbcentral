// DEPENDENCIES
const router = require("express").Router();
const util = require("../../util/util.js");
const helper = require("../helper.js");
const finReportLogic = require("../../logic/FinReports.js");
const githubCacheLogic = require("../../logic/GithubCache.js");
const memberLogic = require("../../logic/Members.js");
const rolesLogic = require("../../logic/Roles.js");

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
        var projection = report.projection;
        var ts = date.getTime();
        var x = util.timeToString(ts, true);
        if (y > 0)
          totalIncome[cat] += y;
        else if (y < 0) {
          totalSpending[cat] += y * -1;
          if (projection !== true) {
            spending.push([x, y]);
            projSpending.push([ts, y]);
          } else {
            futureSpending.push([x, y]);
          }
        }
        balanceTotal += y;
        balance.push([x, balanceTotal]);
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
        return util.timeToString(point, true);
      });
      data.graphs.push({
        elementId: "proj_spending_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      })
      return githubCacheLogic.getUserLines().then(function(
        userLiness) {
        userLines = userLiness || {};
        return memberLogic.getAll();
      }).then(function(mList) {
        members = mList || [];
        members.forEach(function(member) {
          for (var username in userLines) {
            if (member.githubUsername == username) {
              member.totalLines = userLines[username];
              break;
            }
          }
        });

        data.members = members;
        total = members.length;

        var totalYears = {};
        var totalMajors = {};
        totalRoles = {};
        members.forEach(function(member) {
          if (member.year in totalYears)
            totalYears[member.year] += 1;
          else totalYears[member.year] = 1;
          if (member.roleId in totalRoles)
            totalRoles[member.roleId] += 1;
          else totalRoles[member.roleId] = 1;
          var major = member.major.trim().toLowerCase();
          var majors = [];
          if (major.includes(",")) {
            majors = major.split(",");
          } else if (major.includes("/")) {
            majors = major.split("/");
          } else if (major.includes("+")) {
            majors = major.split("+");
          } else {
            majors.push(major);
          }
          majors.forEach(function(major) {
            major = major.trim();
            if (major.includes("electric")) major =
              "eecs";
            else if (major.includes("computer science"))
              major = "cs";
            else if (major.includes("business")) major =
              "business";
            else if (major.includes("engineering"))
              major =
              "engineering";
            else if (major.includes("math") || major.includes(
                "stat"))
              major = "math";
            if (major in totalMajors) totalMajors[major] +=
              1;
            else totalMajors[major] = 1;
          });
        });

        var d = util.genPieData(totalYears, true);
        data.graphs.push({
          elementId: "year_pie",
          type: "pie",
          xData: d[0],
          yData: d[1]
        })
        d = util.genPieData(totalMajors);
        data.graphs.push({
          elementId: "major_pie",
          type: "pie",
          xData: d[0],
          yData: d[1]
        });
        return rolesLogic.get();
      }).then(function(roles) {
        data.roles = roles;
        var formattedTotalRoles = {
          "Leaders": 0,
          "DevCore": 0,
          "Web": 0,
          "Market": 0,
          "Explor": 0
        };
        for (var roleId in totalRoles) {
          var roleName = roles[roleId].title;
          var num = totalRoles[roleId];
          if (roleName.includes("VP") || roleName.includes(
              "Director") ||
            roleName.includes("President") || roleName.includes(
              "Advisor"))
            formattedTotalRoles["Leaders"] += num;
          else if (roleName.includes("Android") || roleName.includes(
              "iOS") ||
            roleName.includes("Contract"))
            formattedTotalRoles["DevCore"] += num;
          else if (roleName.includes("Web"))
            formattedTotalRoles["Web"] += num;
          else if (roleName.includes("Market"))
            formattedTotalRoles["Market"] += num;
          else if (roleName.includes("Explor"))
            formattedTotalRoles["Explor"] += num;
        }
        var d = util.genPieData(formattedTotalRoles, true);
        data.graphs.push({
          elementId: "role_pie",
          type: "pie",
          xData: d[0],
          yData: d[1]
        })
      }).then(function() {
        res.render("index", data);
      });
    });
  });
});

// EXPORTS
module.exports = router;
