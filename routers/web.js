// DEPENDENCIES
const router = require("express").Router();
const routerUtil = require("../util/router.js");
const util = require("../util/util.js");
const dbUtil = require("../util/firebase/db.js");
const memberLogic = require("../logic/Members.js");
const rolesLogic = require("../logic/Roles.js");
const welcomeLogic = require("../logic/Welcome.js");
const assignmentsLogic = require("../logic/Assignments.js");
const expectedAbsencesLogic = require("../logic/ExpectedAbsences.js");
const feedbackLogic = require("../logic/Feedback.js");
const githubCacheLogic = require("../logic/GithubCache.js");
const paymentRequestLogic = require("../logic/PaymentRequests.js");
const finReportLogic = require("../logic/FinReports.js");
const semesterStartLogic = require("../logic/SemesterStart.js");
const canSignUpLogic = require("../logic/CanSignUp.js");
const config = require("../config.json");

// PROTOTYPES
String.prototype.includes = function(str) {
  return this.indexOf(str) >= 0;
}

// HELPERS
function _genPieData(x, noStr) {
  var total = Object.keys(x).map(function(key) {
    return x[key];
  }).reduce(function(sum, ele, i, arr) {
    sum += ele;
    return sum;
  }, 0);
  var strs = [];
  var values = [];

  if (total <= 0) return [strs, values];

  for (var key in x) {
    var value = x[key]
    var percent = Math.ceil((value / total) * 100);
    if (percent > 0) {
      var percent_str = percent + "%";
      var str = "";
      if (!noStr)
        str = key + " (" + percent_str + ")";
      else
        str = percent_str + " (" + value + ")";
      strs.push(str);
      values.push(percent);
    }
  }
  return [strs, values];
}

function _differentDay(d1, d2) {
  var day1 = d1.getDate();
  var day2 = d2.getDate();
  if (day1 != day2) return true;
  var month1 = d1.getMonth();
  var month2 = d2.getMonth();
  if (month1 != month2) return true;
  var year1 = d1.getFullYear();
  var year2 = d2.getFullYear();
  return year1 != year2;
}

function _aggregateByX(data) {
  var newData = {};
  new Set(data.map(function(point) {
    return point[0];
  })).forEach(function(x) {
    data.forEach(function(point) {
      if (point[0] == x) {
        if (!(x in newData)) newData[x] = 0;
        newData[x] += point[1];
      }
    });
  });
  return Object.keys(newData).map(function(x) {
    return [x, newData[x]];
  });
}

function _formatLineData(...dataList) {
  var xVals = dataList[0].map(function(tuple) {
    return tuple[0];
  });
  var yVals = dataList.map(function(data) {
    return data.map(function(tuple) {
      return tuple[1];
    })
  });
  return [xVals, yVals];
}

function _getLiTag(currPage) {
  return function(page) {
    if (currPage != page) return "<li>";
    return "<li class='active'>";
  }
}

function _getCurrDateStr() {
  var d = new Date();
  return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
}

function _timeToString(time) {
  var d = new Date();
  d.setTime(time);
  return util.dateToString(d);
}

function _getMemberName(members, member) {
  var mList = members.filter(function(m) {
    return m._key == member;
  });
  if (mList.length == 0) return "NULL";
  return mList[0].name;
}

function _getMemberNames(members, ms) {
  var mList = members.filter(function(m) {
    return ms.indexOf(m._key) >= 0;
  });
  if (mList.length == 0) return "ALLNULL";
  return mList.map(function(m) {
    return m.name + ", ";
  });
}

function _getFirstName(name) {
  if (name.indexOf(" ") < 0) return name;
  return name.split(" ")[0];
}

function _roleIdsToString(roles, roleIds) {
  return roleIds.map(function(roleId) {
    return roles[roleId].title + " ";
  });
}

function _getDocById(id) {
  return config.docs[id - 1];
}

function _genData(currPage, uid) {
  var data = {
    getMemberNames: _getMemberNames,
    getMemberName: _getMemberName,
    timeToString: _timeToString,
    getCurrDateStr: _getCurrDateStr,
    firstname: "Visitor",
    notifications: [],
    currPage: currPage,
    leadership: false,
    graphs: [],
    getLiTag: _getLiTag(currPage)
  };
  return rolesLogic.get().then(function(roles) {
    data.roles = roles;
    if (!uid) return Promise.resolve(data);
    return memberLogic.getById({
      id: uid
    }).then(function(user) {
      data.firstname = _getFirstName(user.name);
      data.leadership = user.leadership === true;
      data.user = user;
      return data;
    });
  });
}

// METHODS
router.get("/", function(req, res) {
  res.redirect("/home");
});

router.get("/login", function(req, res) {
  _genData("login").then(function(data) {
    res.render("index", data);
  });
});

router.get("/home", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var id = req.cookies.member;
  var data;
  _genData("home", id).then(function(d) {
    data = d;
    return memberLogic.getById({
      id: id
    });
  }).then(function(member) {
    var plist = [];
    var num_absences = 0;
    var num_expected = 0;

    plist.push(paymentRequestLogic.getByMember({
      member: id
    }).then(function(requests) {
      data.requests = requests;
    }));

    plist.push(expectedAbsencesLogic.getByUid({
      member: id
    }).then(function(expectedAbsences) {
      data.expectedAbsences = expectedAbsences;
      num_expected = expectedAbsences.length;
    }));

    plist.push(memberLogic.getRole({
      id: id
    }).then(function(role) {
      data.role = role;
    }));

    plist.push(welcomeLogic.getEvent().then(function(event) {
      data.event = event.title || event.summary;
      data.eventId = event.id;
    }));

    plist.push(welcomeLogic.listAbsences({
      member: member
    }).then(function(absences) {
      data.absences = absences.length;
      num_absences = absences.length;
      return welcomeLogic.listSignIns({
        member: member
      });
    }).then(function(signins) {
      data.signins = signins;
      return memberLogic.getMaxAbsences({
        id: id
      });
    }).then(function(max_absences) {
      var absencesLeft = undefined;
      if (max_absences >= num_absences) {
        absencesLeft = "Left: " + (max_absences - num_absences);
      } else {
        absencesLeft = "Over: " + ((max_absences - num_absences) *
          -1);
      }
      data.graphs.push({
        elementId: "attendance_overview_bar",
        type: "bar",
        xData: ['Absences',
          'Inluding Expected', 'Max Absences'
        ],
        yData: [
          [num_absences, num_absences + num_expected,
            max_absences
          ]
        ]
      })
      var attendances = [];
      for (var i = 0; i < data.signins.length; i++) {
        var signin = data.signins[i];
        signin.type = "Attended";
        var date = new Date();
        date.setTime(signin.timestamp);
        signin.date = util.dateToString(date);
        attendances.push(signin);
      }
      for (var i = 0; i < data.absences.length; i++) {
        var absence = data.absences[i];
        absence.type = "Absent";
        var date = new Date();
        date.setTime(absence.timestamp);
        absence.date = util.dateToString(date);
        attendances.push(absence);
      }
      for (var i = 0; i < data.expectedAbsences.length; i++) {
        var expectedAbsence = data.expectedAbsences[i];
        expectedAbsence.type = "Expected Absent";
        var date = new Date();
        date.setTime(expectedAbsence.timestamp);
        expectedAbsence.date = util.dateToString(date);
        attendances.push(expectedAbsence);
      }
      data.absencesLeft = absencesLeft;
      data.attendances = attendances;
    }));

    return Promise.all(plist);
  }).then(function() {
    data.attendances = data.attendances.sort(function(a, b) {
      return a.timestamp - b.timestamp;
    });
    res.render("index", data);
  });
});

router.get("/assignments", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("assignments", member).then(function(data) {
    return assignmentsLogic.getAssignmentScores({
      member: member,
      roleId: data.user.roleId
    }).then(function(assignments) {
      data.assignments = assignments;
      res.render("index", data);
    });
  });
});

router.get("/financial", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("financial", member).then(function(data) {
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
      data.categories.forEach(function(category) {
        totalSpending[category] = 0;
        totalIncome[category] = 0;
      });
      var today = new Date();
      data.reports.sort(function(a, b) {
        var tsA = new Date(a.date).getTime();
        var tsB = new Date(b.date).getTime();
        return tsA - tsB;
      }).forEach(function(report) {
        var y = report.dollars;
        var date = new Date(report.date);
        var cat = report.category;
        var ts = date.getTime();
        var x = _timeToString(ts);
        if (ts > today.getTime() && _differentDay(date, today) &&
          y < 0) {
          futureSpending.push([x, y]);
          spending.push([x, 0]);
        } else {
          if (y > 0)
            totalIncome[cat] += y;
          else if (y < 0) {
            totalSpending[cat] += y * -1;
            futureSpending.push([x, 0]);
            spending.push([x, y]);
          }
        }
        projSpending.push([ts, y]);
      });
      spending = _aggregateByX(spending);
      futureSpending = _aggregateByX(futureSpending);
      projSpending = _aggregateByX(projSpending);
      var d = _genPieData(totalSpending);
      data.graphs.push({
        elementId: "category_spending_graph",
        type: "pie",
        xData: d[0],
        yData: d[1]
      });
      d = _genPieData(totalIncome);
      data.graphs.push({
        elementId: "category_income_graph",
        type: "pie",
        xData: d[0],
        yData: d[1]
      });
      d = _formatLineData(spending, futureSpending);
      data.graphs.push({
        elementId: "spending_graph",
        type: "line",
        xData: d[0],
        yData: d[1]
      });
      d = util.getProjectedPoints(projSpending, 2);
      d = _formatLineData(d);
      d[0] = d[0].map(function(point) {
        return _timeToString(point);
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

router.get("/calendar", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("calendar", member).then(function(data) {
    return semesterStartLogic.get().then(function(semesterStart) {
      return welcomeLogic.getEventsSoFar(semesterStart);
    }).then(function(events) {
      data.events = events;
      return welcomeLogic.getEvent().catch(function(error) {
        return null;
      });
    }).then(function(event) {
      if (event) data.closestEventId = event.id;
      else data.closestEventId = null;
      res.render("index", data);
    });
  });
});

router.get("/leadership", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  _genData("leadership", member).then(function(d) {
    data = d;

    if (!data.leadership) {
      res.redirect("/home");
      return;
    }

    var plist = [];
    var members = [];
    var totalRoles = {};
    var userLines = {};
    var total = 0;

    plist.push(canSignUpLogic.get().then(function(bool) {
      data.canSignUp = bool;
    }));

    plist.push(semesterStartLogic.get().then(function(semesterStart) {
      data.semesterStart = semesterStart;
      return welcomeLogic.getEventsSoFar(semesterStart);
    }).then(function(events) {
      data.events = events;
    }));

    plist.push(paymentRequestLogic.getAll().then(function(requests) {
      data.requests = requests;
    }));

    plist.push(welcomeLogic.getEvent().then(function(event) {
      data.closestEventId = event.id;
    }))

    plist.push(feedbackLogic.getAll().then(function(feedbacks) {
      data.feedbacks = feedbacks;
    }));

    plist.push(assignmentsLogic.getAll().then(function(assignments) {
      data.assignments = assignments;
      if (assignments.length == 0) return [];
      return assignmentsLogic.getAllScores();
    }).then(function(d) {
      data.scores = d.scores;
      data.num_scores = d.num_scores;
    }));

    plist.push(expectedAbsencesLogic.getAll()
      .then(function(expectedAbsences) {
        data.expectedAbsences = expectedAbsences;
      }));

    plist.push(githubCacheLogic.getUserLines().then(function(userLiness) {
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
          if (major.includes("electric")) major = "eecs";
          else if (major.includes("computer science"))
            major = "cs";
          else if (major.includes("business")) major =
            "business";
          else if (major.includes("engineering")) major =
            "engineering";
          else if (major.includes("math") || major.includes(
              "stat"))
            major = "math";
          if (major in totalMajors) totalMajors[major] +=
            1;
          else totalMajors[major] = 1;
        });
      });

      var d = _genPieData(totalYears, true);
      data.graphs.push({
        elementId: "year_pie",
        type: "pie",
        xData: d[0],
        yData: d[1]
      })
      d = _genPieData(totalMajors);
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
      var d = _genPieData(formattedTotalRoles, true);
      data.graphs.push({
        elementId: "role_pie",
        type: "pie",
        xData: d[0],
        yData: d[1]
      })
    }));
    return Promise.all(plist);
  }).then(function() {
    data.expectedAbsences = data.expectedAbsences.sort(function(a, b) {
      return a.title - b.title;
    });
    data.assignments = data.assignments.sort(function(a, b) {
      return a.due - b.due;
    });
    data.members = data.members.sort(function(a, b) {
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    data.roleIdsToString = _roleIdsToString;
    data.leaders = data.members.filter(function(member) {
      return member.leadership === true;
    });
    res.render("index", data);
  });
});

router.get("/policies", function(req, res) {
  res.redirect("/policies/1");
});

router.get("/policies/:id", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  _genData("policies", member).then(function(data) {
    data.docPath = _getDocById(req.params.id);
    res.render("index", data);
  });
});

router.get("/profile", function(req, res) {
  if (!req.cookies.member) {
    res.redirect("/login");
    return;
  }
  var member = req.cookies.member;
  var data;
  _genData("profile", member).then(function(d) {
    data = d;
    return memberLogic.getCardInfo({
      member: member
    });
  }).then(function(card) {
    data.cardInfo = card;
    res.render("index", data);
  });
});

// EXPORTS
module.exports = router;
