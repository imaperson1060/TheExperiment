let globals = {};

function stage(id) {
    $(".stage").each((i, x) => $(x).hide());
    $(`#stage${id}`).show();

    if (funcs[id.toString()]) funcs[id.toString()]();
}

function mode(mode) {
    if (mode == "light") {
        globals["lightmode"] = true;
        $(".darkmode").removeClass("bg-dark text-white");

        $("#mode").attr("onclick", "mode('dark')").html("<i class='bi bi-moon-fill'></i>");
    } else {
        globals["lightmode"] = false;
        $(".darkmode").addClass("bg-dark text-white");

        $("#mode").attr("onclick", "mode('light')").html("<i class='bi bi-sun-fill'></i>");
    }
}

$(document).ready(() => {
    stage(1);

    globals["lightmode"] = false;
});

const funcs = {
    "1": () => {
        // globals["stage1_checkselected"] = setInterval(() => {
        //     if ($(window.getSelection().focusNode.parentElement).hasClass("stage1-select")) {
        //         $("#stage1-rulesbtn").attr("onclick", "stage('3')");
        //         $(".text-white.stage1-select").removeClass("text-white");
        //         clearInterval(globals["stage1_checkselected"]);
        //     }
        // }, 100);
    },
    "2": () => {
        // clearInterval(globals["stage1_checkselected"]);
    },
    "3": () => {
        globals["shuffle"] = false;
        globals["viewnumbers"] = false;
        globals["stats"] = false;

        $("#stage3_shuffle").change(() => {
            globals["shuffle"] = true;

            $("#stage3_shuffle").attr("disabled", true);
            $("#stage3_shuffle_text").html("Haha no backsies");
        });
        $("#stage3_numbers").change(() => globals["viewnumbers"] = !globals["viewnumbers"]);
        $("#stage3_stats").change(() => globals["stats"] = !globals["stats"]);
    },
    "4": () => {
        globals["round"] = globals["round"] + 1 || 1;

        (shuffle => {
            let html = "";
            let buttons = 50;
            let ids = [];
    
            html += `<div class="row">`;
            if (screen.width > 1000) {
                for (var i = 1; i <= 10; i++) {
                    html += `<div class="col">`;
                    for (var j = 0; j < 5; j++) {
                        if (shuffle && globals["round"] != 1) {
                            (function pickRandom() {
                                let random = Math.floor(Math.random() * buttons);

                                if (ids.includes(random)) return pickRandom();

                                html += `<div class="mb-1">
                                    <button id="game_btn_${random + 1}" btn-id="${random + 1}" class="btn btn-secondary btn-lg game_btn">${globals["viewnumbers"] ? (random + 1 < 10 ? `&nbsp;${random + 1}&nbsp;` : random + 1) : "&nbsp;&nbsp;&nbsp;&nbsp;"}</button>
                                </div>`;

                                ids.push(random);
                            })();
                        } else {
                            html += `<div class="mb-1">
                                <button id="game_btn_${(j * 10) + i}" btn-id="${(j * 10) + i}" class="btn btn-secondary btn-lg game_btn">${globals["viewnumbers"] ? (((j * 10) + i) < 10 ? `&nbsp;${(j * 10) + i}&nbsp;` : (j * 10) + i) : "&nbsp;&nbsp;&nbsp;&nbsp;"}</button>
                            </div>`;
                        }
                    }
                    html += `</div>`;
                }
            } else {
                for (var i = 1; i <= 5; i++) {
                    html += `<div class="col">`;
                    for (var j = 0; j < 10; j++) {
                        if (shuffle && globals["round"] != 1) {
                            (function pickRandom() {
                                let random = Math.floor(Math.random() * buttons);

                                if (ids.includes(random)) return pickRandom();

                                html += `<div class="mb-1">
                                    <button id="game_btn_${random + 1}" btn-id="${random + 1}" class="btn btn-secondary btn-lg game_btn">${globals["viewnumbers"] ? (random + 1 < 10 ? `&nbsp;${random + 1}&nbsp;` : random + 1) : "&nbsp;&nbsp;&nbsp;&nbsp;"}</button>
                                </div>`;

                                ids.push(random);
                            })();
                        } else {
                            html += `<div class="mb-1">
                                <button id="game_btn_${(j * 5) + i}" btn-id="${(j * 5) + i}" class="btn btn-secondary btn-lg game_btn">${globals["viewnumbers"] ? (((j * 5) + i) < 10 ? `&nbsp;${(j * 5) + i}&nbsp;` : (j * 5) + i) : "&nbsp;&nbsp;&nbsp;&nbsp;"}</button>
                            </div>`;
                        }
                    }
                    html += `</div>`;
                }
            }
    
            html += `</div>`;
    
            $("#stage4_buttons").html(html);
        })(globals["shuffle"]);

        $("#stage4_progress").attr("aria-valuenow", 0).width("0%");


        // Game logic

        globals["score"] = globals["score"] || 0;

        let lastTime = new Date().getTime();
        let time = 0 - ((1000 - ((globals["round"] - 1) * 25)) / 1000);
        let reactTime = 0;
        let reactTimeAvg = [];

        globals["buttons"] = globals["buttons"] || new Array(50);
        for (var i = 0; i < 50; i++) {
            if (!globals["buttons"][i]) globals["buttons"][i] = { id: i + 1, enabled: true, used: false, round: 1 };
            else if (globals["buttons"][i].enabled) Object.assign(globals["buttons"][i], { enabled: true, used: false, round: globals["round"] });
            else $(`#game_btn_${globals["buttons"][i].id}`).attr("disabled", true);
        }

        $(".game_btn").click(e => {
            if (globals["pause"]) return;

            if ($(e.target).hasClass("btn-warning") || (!$(".btn-warning.game_btn").length && globals["buttons"].filter(x => x.enabled && !x.used).length == 1)) {
                $(e.target).removeClass("btn-warning").addClass("btn-success").attr("disabled", true);
                globals["buttons"].find(y => y.id == $(e.target).attr("btn-id")).used = true;
                
                // I suck at math, sorry!
                // First part: (1000 / (1000 - (round * 25))), i.e. round 1 is 1.025 and round 2 is 1.052
                // Second part: Points based on reaction time, i.e. 0.2 second reaction time is + 0.8 points (if the react time is above 1, because JS intervals are dumb, use default reaction time)
                // I'm not entirely sure if this works but it seems fairly accurate and I don't want to touch it now that it's working
                globals["score"] += ((1000 / (1000 - ((globals["round"] - 1) * 25))) + (1 - +((1000 - ((globals["round"] - 1) * 25)) - (time - reactTime).toFixed(1) > 0 ? (time - reactTime).toFixed(1) : (1000 - ((globals["round"] - 1) * 25))))) * 10;

                reactTimeAvg.push((1000 - ((globals["round"] - 1) * 25)) - (time - reactTime).toFixed(1) > 0 ? (time - reactTime).toFixed(1) : (1000 - ((globals["round"] - 1) * 25)));
                reactTime = time;
            } else {
                globals["buttons"].find(y => y.id == $(e.target).attr("btn-id")).enabled = false;
                $(e.target).attr("disabled", true).removeClass("btn-warning").addClass("btn-danger");
            }

            $("#stage4_progress").attr("aria-valuenow", (100 * globals["buttons"].filter(x => (!x.enabled || x.used) && x.round == globals["round"]).length) / globals["buttons"].filter(x => x.round == globals["round"]).length).width(`${$("#stage4_progress").attr("aria-valuenow")}%`);
        });

        const game = setInterval(() => {
            if (globals["pause"]) return;

            if ($(".game_btn.btn-warning").length > 0) {
                $(".game_btn.btn-warning").each((i, x) => globals["buttons"].find(y => y.id == $(x).attr("btn-id")).enabled = false);
                $(".game_btn.btn-warning").attr("disabled", true).removeClass("btn-warning").addClass("btn-danger");
                
                reactTimeAvg.push((1000 - ((globals["round"] - 1) * 25)) - (time - reactTime).toFixed(1) > 0 ? (time - reactTime).toFixed(1) : (1000 - ((globals["round"] - 1) * 25)));
                reactTime = time;
            }

            if (!globals["buttons"].filter(x => x.enabled).length) {
                clearInterval(game);
                clearInterval(timer);

                globals["rounds"] = globals["rounds"] || [];
                globals["rounds"].push({ success: globals["buttons"].filter(x => x.enabled && x.used).length, fail: globals["buttons"].filter(x => !x.enabled && x.round == globals["round"]).length, total: globals["buttons"].filter(x => x.round == globals["round"]).length, time: { interval: (1000 - ((globals["round"] - 1) * 25)) / 1000, react: eval(reactTimeAvg.join("+")) / reactTimeAvg.length, total: time } });

                return stage("6");
            } else if (!globals["buttons"].filter(x => x.enabled && !x.used).length) {
                clearInterval(game);
                clearInterval(timer);
                
                globals["rounds"] = globals["rounds"] || [];
                globals["rounds"].push({ success: globals["buttons"].filter(x => x.enabled && x.used).length, fail: globals["buttons"].filter(x => !x.enabled && x.round == globals["round"]).length, total: globals["buttons"].filter(x => x.round == globals["round"]).length, time: { interval: (1000 - ((globals["round"] - 1) * 25)) / 1000, react: eval(reactTimeAvg.join("+")) / reactTimeAvg.length, total: time } });

                return stage("5");
            }

            let random = Math.floor(Math.random() * globals["buttons"].filter(x => x.enabled && !x.used).length);
            $(`#game_btn_${globals["buttons"].filter(x => x.enabled && !x.used)[random].id}`).removeClass("btn-secondary").addClass("btn-warning");

            globals["buttons"].filter(x => x.enabled && !x.used)[random].used = true;

            $("#stage4_progress").attr("aria-valuenow", (100 * (globals["buttons"].filter(x => (!x.enabled || x.used) && x.round == globals["round"]).length - 1)) / globals["buttons"].filter(x => x.round == globals["round"]).length).width(`${$("#stage3_progress").attr("aria-valuenow")}%`);
        }, 1000 - ((globals["round"] - 1) * 25));

        const timer = setInterval(() => {
            if (globals["pause"]) {
                $("#stage4_pause").removeClass("btn-secondary").addClass("btn-primary");

                $(".game_btn:not(:disabled)").attr("disabled", true).addClass("paused");

                return;
            } else {
                $("#stage4_pause").removeClass("btn-primary").addClass("btn-secondary");

                $(".game_btn.paused").attr("disabled", false).removeClass("paused");
            }

            time = parseFloat((time + (0.001 * (new Date().getTime() - lastTime).toFixed(3))).toFixed(3));
            lastTime = new Date().getTime();
            $("#stage4_time").html(`${((1000 - ((globals["round"] - 1) * 25)) * (globals["buttons"].filter(x => x.enabled && !x.used).length)) / 1000}s`);

            if ($("#stage4_score").html() < Math.round(globals["score"])) $("#stage4_score").html(+$("#stage4_score").html() + 1);
        }, 1);
    },
    "5": () => {
        let html = "";

        html += "<ul>";
        html += `<li>Successful button presses: ${globals["rounds"][globals["round"] - 1].success}/${globals["rounds"][globals["round"] - 1].total}</li>`;
        html += `<li>Failed button presses: ${globals["rounds"][globals["round"] - 1].fail}/${globals["rounds"][globals["round"] - 1].total}</li>`;
        html += `<li>Buttons remaining: ${globals["rounds"][globals["round"] - 1].success}/${globals["buttons"].length}</li>`;
        if (globals["stats"]) {
            html += "<li>Experimental stats:</li>";
            html += "<ul>";
            html += `<li>Given reaction time: ${globals["rounds"][globals["round"] - 1].time.interval} seconds</li>`;
            html += `<li>Average reaction time (rounded): ${globals["rounds"][globals["round"] - 1].time.react.toFixed(2)} seconds</li>`;
            html += `<li>Total time: ${globals["rounds"][globals["round"] - 1].time.total} seconds</li>`;
            html += "</ul>";
        }
        html += "</ul>";

        $("#stage5_round").html(globals["round"]);
        $("#stage5_info").html(html);
    },
    "6": () => {
        $("#stage6_roundCount").html(globals["round"]);

        let html = "";

        globals["rounds"].forEach((x, i) => {
            html += `<div class="accordion-item">`;

            html += `<h2 class="accordion-header" id="stage6_breakdown_round${i + 1}_heading">`;
            html += `<button class="accordion-button darkmode ${!globals["lightmode"] ? "bg-dark text-white" : ""} collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#stage6_breakdown_round${i + 1}" aria-expanded="false" aria-controls="stage6_breakdown_round1">Round ${i + 1}</button>`;
            html += "</h2>";

            html += `<div id="stage6_breakdown_round${i + 1}" class="accordion-collapse collapse" aria-labelledby="stage5_breakdown_round${i + 1}_heading" data-bs-parent="#stage6_breakdown">`;

            html += `<div class="accordion-body darkmode ${!globals["lightmode"] ? "bg-dark text-white" : ""}">`;
            html += "<ul>";
            html += `<li>Successful button presses: ${x.success}/${x.total}</li>`;
            html += `<li>Failed button presses: ${x.fail}/${x.total}</li>`;
            html += `<li>Buttons remaining: ${x.success}/${globals["buttons"].length}</li>`;
            if (globals["stats"]) {
                html += "<li>Experimental stats:</li>";
                html += "<ul>";
                html += `<li>Given reaction time: ${x.time.interval} seconds</li>`;
                html += `<li>Average reaction time (rounded): ${x.time.react.toFixed(2)} seconds</li>`;
                html += `<li>Total time: ${x.time.total} seconds</li>`;
                html += "</ul>";
            }
            html += "</ul>";
            html += "</div>";

            html += "</div>";

            html += "</div>";
        });

        $("#stage6_breakdown").html(html);

        setInterval(() => { if ($("#stage6_score").html() < Math.round(globals["score"])) $("#stage6_score").html(+$("#stage6_score").html() + 1); }, 1);

        setInterval(() => $("#billy").html(Math.random() * 100), 100);
    }
}