/**
 * 
 **/


jsPsych.plugins["snap-draw"] = (function () {

    const plugin = {};

    plugin.info = {
        name: 'snap-draw',
        description: '',
        parameters: {
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: 200,
                description: 'The stimulus display interval.'
            },
            feedback_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Feedback display duration',
                default: 1000,
                description: 'The feedback display interval.'
            },
            radius: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Circle radius',
                default: 150,
                description: 'The radius of the invisible circle for generating stimuli.'
            },
            angle: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Starting angle',
                default: null,
                description: 'The starting angle of the wedge for generating stimulus.'
            },
            wedge_degrees: {
                type: jsPsych.plugins.parameterType.FLOAT,
                pretty_name: 'Wedge degrees',
                default: 60,
                description: 'The central angle, in degrees of the "wedge", or circular sector.'
            },
            condition: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 1,
                pretty_name: 'Condition',
                description: 'Stimulus condition (position) for the middle point.'
            },
            treatment: {
                type: jsPsych.plugins.parameterType.BOOL,
                default: true,
                pretty_name: 'Treatment',
                description: 'Whether to show the second dot on the circle or not as reference.'
            },
            dot_to_guess: {
                type: jsPsych.plugins.parameterType.INT,
                default: 1,
                pretty_name: 'Dot to guess',
                description: 'Which dot to guess if subject guesses only one'
            },
            mask_dot_ratio: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 4 / Math.PI,
                pretty_name: 'Mask dot ratio',
                description: 'The ratio of the number of dots over the radius'
            },
            width: {
                type: jsPsych.plugins.parameterType.INT,
                default: 600,
                pretty_name: 'Width',
                description: 'Width of the SVG canvas.'
            },
            height: {
                type: jsPsych.plugins.parameterType.INT,
                default: 400,
                pretty_name: 'Height',
                description: 'Height of the SVG canvas.'
            },
            response_render_dist: {
                type: jsPsych.plugins.parameterType.FLOAT,
                default: 25.0,
                pretty_name: "Response rendering distance",
                description: 'The distance threshold (in pixels) for rendering a response dot.'
            },
            scale_factor: {
                type: jsPsych.plugins.parameterType.FUNCTION,
                default: () => 1.0,
                pretty_name: "The scaling factor for all rendering (should be a function!)",
                description: "The scaling factor for all plotting."
            }
        }
    };

    plugin.trial = function (displayElement, trial) {
        // get the scale_factor for the current trial
        const scale_factor = trial.scale_factor();

        /**
         * Find the closest point on the trial circle
         * for a given point by its coordinates (x0, y0).
         */
        function findClosestPoint(x0, y0) {
            angle = Snap.atan(Math.abs(y0) / Math.abs(x0));
            x = Snap.cos(angle) * trial.radius * scale_factor;
            y = Snap.sin(angle) * trial.radius * scale_factor;

            if (x0 < 0) {
                x *= -1;
            }
            if (y0 < 0) {
                y *= -1;
            }
            return [x, y];
        }

        const stimulus = '<div><svg id="svg" width="' + (trial.width * scale_factor) + '" height="' +
            (trial.height * scale_factor) + '" class="hide-cursor"></svg>' +
            '<div class="clearfix" id="submit-container"><div class="float-right">' +
            '<button type="button" class="btn btn-default finish-trial">Submit</button></div></div></div>';

        // initialize stimulus degrees
        const stimulusDegrees = (trial.wedge_degrees * trial.condition) + trial.angle;

        // render the SVG canvas for drawing stimuli
        displayElement.innerHTML = stimulus;

        // hide the submit button initially.
        $("#submit-container").css('visibility', 'hidden');


        // common translation transformation to be applied to SVG elements.
        const translation = "translate(" + trial.width * scale_factor / 2 +
            " " + trial.height * scale_factor / 2 + ")";

        // initialize Snap SVG drawing library
        const s = Snap("#svg");

        // stays the same
        // // initialize the fixation point and circle
        // const fixationPoint = s.text(0, 0, "+");
        // fixationPoint.attr({
        //     "fill": "#aaa",
        //     "font-size": "24px",
        //     "display": "none",
        //     "text-anchor": "middle",
        //     "alignment-baseline": "central"
        // });
        // fixationPoint.transform(translation);

        // fixationLine1 = s.line(50, 50, 400, 400);
        // fixationLine1.attr({
        //     "fill": "#aaa",
        //     "stroke_width": 2
        // })

        //fixationLine1.transform(translation);

        const circleBase = s.circle(0, 0, trial.radius * scale_factor, fill = "none");
        circleBase.attr({
            stroke: '#aaa',
            fill: '#dddddd00'
        });
        circleBase.transform(translation);

        const circleCenter = s.circle(0, 0, 5 * scale_factor);
        circleCenter.attr({
            stroke: '#aaa',
            fill: '#aaa'
        });
        circleCenter.transform(translation);

        const fixationStructure = s.g(
            circleBase,
            //fixationPoint,
            circleCenter,
            //fixationLine1
        )


        const canvasOffset = $("#svg").offset();


        // define the frames to be rendered as one concrete stimulus
        function showFixation() {

            //fixationPoint.attr({ display: "block" }); // spatial features
            fixationStructure.attr({ display: "block" });

            // trigger the next frame after 1 second.
            jsPsych.pluginAPI.setTimeout(function () {
                drawStimulus();
            }, 1000);
        }

        function drawStimulus() {
            const R = trial.radius;
            if (typeof trial.angle === "undefined" || trial.angle === null) {
                trial.angle = Math.random() * 360;
            }

            // the angles for the wedge on the circle
            const degStart = trial.angle;
            const degStim = degStart + (trial.wedge_degrees * trial.condition)
            const degEnd = degStart + trial.wedge_degrees;

            // compute the coordinates (in cartesian coordinate system) of the two points on
            const x1 = Snap.sin(degStart) * R * scale_factor;
            const y1 = Snap.cos(degStart) * R * scale_factor;
            const x2 = Snap.sin(degEnd) * R * scale_factor;
            const y2 = Snap.cos(degEnd) * R * scale_factor;


            // compute the X and Y coordinates of the stimulus
            const stimulusPosition = trial.condition;
            const xStim = Snap.sin(stimulusDegrees) * R * scale_factor;
            const yStim = Snap.cos(stimulusDegrees) * R * scale_factor;

            // record the position of the stimulus
            // trial.stimulus = { x: [x1, xStim, x2], y: [y1, yStim, y2] };
            trial.stimulus = { x: [x1, xStim, x2], y: [y1, yStim, y2], deg: [degStart, degStim, degEnd] };

            // the stimulus point, as a filled circle/dot of radius 3.
            const dotStimulus = s.circle(xStim, yStim, 3 * scale_factor);
            dotStimulus.transform(translation);

            dotStimulus.attr({
                fill: "000"
            })

            let referencePoints = null;
            referencePoints = s.g(
                s.circle(x1, y1, 3 * scale_factor),
                s.circle(x2, y2, 3 * scale_factor)
            );

            referencePoints.attr({
                fill: "#000000"
            }).transform(translation);

            const stimGroup = s.g(referencePoints);

            // transition to the next frame.
            jsPsych.pluginAPI.setTimeout(function () {
                showMask(dotStimulus, stimGroup);//, lineSegment);
            }, trial.trial_duration);
        }

        // stimulusPoint is the middle point.
        // stimulusGroup is a SVG element group consisting of the reference points (outside points).
        // and is passed through this frame to the next.
        function showMask(stimulusPoint, stimulusGroup) {
            // hide fixation point during mask rendering
            fixationStructure.attr({ display: "none" });

            const maskRadius = trial.radius * 1.5 * scale_factor;
            const r2 = maskRadius * maskRadius;

            // hide the entire stimulus group for now
            stimulusGroup.attr({
                display: "none"
            });

            // remove the ground truth stimulus
            stimulusPoint.remove();

            // generate random masks
            const numOfMaskPoints = Math.ceil(trial.mask_dot_ratio *
                trial.radius);// mask dots density not change with scale_factor
            const maskGroup = s.group();
            let maskGenerated = 0;
            maskGroup.transform(translation);

            while (maskGenerated < numOfMaskPoints) {
                const x = (Math.random() - 0.5) * 2 * maskRadius;
                const y = (Math.random() - 0.5) * 2 * maskRadius;
                // check if the randomly generated point is within the mask circle
                if (x * x + y * y < r2) {
                    const maskPoint = s.circle(x, y, 3 * scale_factor);
                    maskGroup.add(maskPoint);
                    maskGenerated += 1;
                }
            }

            // render the mask for 1000ms, then transition to the last frame to collect
            // subject response.
            jsPsych.pluginAPI.setTimeout(function () {
                solicitResponse(stimulusGroup, maskGroup);
            }, 1000);

        }

        function solicitResponse(stimulusGroup, maskGroup) {
            // remove the entire mask group, when the new frame is displayed
            maskGroup.remove();

            // put circle and fixation back in
            fixationStructure.attr({ display: "block" });

            let num_clicks = 0;
            let num_clicks_needed = 3;

            // if treatment, show reference points again (recall middle dot position)
            if (!trial.treatment) {
                num_clicks_needed = 1;
                let referencePoints = null;

                // determine which to show
                let ref_1 = 0;
                let ref_2 = 2;

                if (trial.dot_to_guess == 0) {
                    ref_1 = 1;
                }

                if (trial.dot_to_guess == 2) {
                    ref_2 = 1;
                }

                // dots reappear
                referencePoints = s.g(
                    s.circle(trial.stimulus.x[ref_1], trial.stimulus.y[ref_1], 3 * scale_factor),
                    s.circle(trial.stimulus.x[ref_2], trial.stimulus.y[ref_2], 3 * scale_factor),
                );

                referencePoints.attr({
                    fill: "#000000"
                }).transform(translation);
            }

            // display the mouse cursor again
            $("#svg").removeClass("hide-cursor");

            const distSq = trial.response_render_dist * trial.response_render_dist;
            const startingTime = new Date().getTime()

            // subject's recollection of the point placements in space.
            // TODO: check scale_factor???
            const subjResponse = [];
            const subjClicks = s.group().transform(translation);
            // TODO: see fi want to do this way
            const subjTemporaryPoints = [];

            // the point recalled by the subject, one at a time.
            let point = [-trial.width * scale_factor, -trial.height * scale_factor];
            const dotContainer = s.group().transform(translation);

            let closestDot = s.circle(0, 0, 3 * scale_factor);
            closestDot.transform("t" + point[0] + "," + point[1]);
            dotContainer.add(closestDot);

            // flag indicating whether a click is permitted or not
            let clickPermitted = false;

            let movePermitted = false;
            let closestPoint = 0;

            const mouseMoveHandler = function (e) {
                if (num_clicks >= num_clicks_needed) {
                    if (!movePermitted) {
                        return;
                    }
                }
                // relative offset of the mouse cursor to the top-left corner of the canvas.
                const offsetX = e.pageX - canvasOffset.left;
                const offsetY = e.pageY - canvasOffset.top;

                // coordinates relative to the center of the circle (and canvas)
                const x = offsetX - trial.width * scale_factor / 2;
                const y = offsetY - trial.height * scale_factor / 2;

                point = findClosestPoint(x, y);

                // calculate the distance between the point on line and the mouse cursor
                // this stays the same 
                const distBetweenPoints = Math.pow(x - point[0], 2) +
                    Math.pow(y - point[1], 2);

                if (distBetweenPoints < distSq) {
                    clickPermitted = true;
                    // update the position of the rendered dot corresponding to the closest point.
                    closestDot.transform("t" + point[0] + "," + point[1]);
                } else {
                    // move the dot out of sight
                    closestDot.transform("t" + -trial.width * scale_factor + "," +
                        -trial.height * scale_factor);
                    clickPermitted = false
                }
            };

            const clickHandler = function (e) {
                // relative offset of the mouse cursor to the top-left corner of the canvas.
                const offsetX = e.pageX - canvasOffset.left;
                const offsetY = e.pageY - canvasOffset.top;

                // coordinates relative to the center of the circle (and canvas)
                const x = offsetX - trial.width * scale_factor / 2;
                const y = offsetY - trial.height * scale_factor / 2;

                if (num_clicks >= num_clicks_needed) {
                    // 1- a function that guesses which dot you're close enough too
                    //let closestPoint = 0;
                    let minDist = Number.MAX_SAFE_INTEGER;

                    for (let i = 0; i < num_clicks; i++) {
                        let currClickX = subjTemporaryPoints[i][0];
                        let currClickY = subjTemporaryPoints[i][1];

                        let currMin = pointDistanceSq(x, currClickX, y, currClickY);
                        if (currMin < minDist) {
                            minDist = currMin;
                            closestPoint = i;
                        }
                    }

                    if (!(minDist < distSq)) {
                        return;
                    }


                    // delete visual
                    subjClicks[closestPoint].remove();
                    subjTemporaryPoints.splice(closestPoint, 1);
                    subjResponse.splice(closestPoint, 1);

                    movePermitted = true;
                    num_clicks--;

                    $("#submit-container").css('visibility', 'hidden');

                    return;
                }

                if (!clickPermitted) return;

                const clickedPoint = s.circle(point[0], point[1], 3 * scale_factor);
                subjClicks.add(clickedPoint);
                subjTemporaryPoints.push([point[0], point[1]]);


                // move the dot out of sight after click
                closestDot.transform("t" + -trial.width * scale_factor + "," +
                    -trial.height * scale_factor);

                const clickTime = new Date().getTime()

                const response = {
                    x: x,// mouse position
                    y: y,
                    cx: point[0],// the calculated position on the circle
                    cy: point[1],
                    deg: Math.atan(point[1] / point[0]) * (180 / Math.PI),
                    timeInterval: clickTime - startingTime // RT: response time
                };

                subjResponse.push(response);

                num_clicks++;
                if (num_clicks == num_clicks_needed) {
                    movePermitted = false;

                    $("#submit-container").css('visibility', 'visible');
                    $(".finish-trial").on('click', function (e) {

                        orderedResp = subjResponse;

                        if (trial.treatment) {
                            [orderedResp, error] = orderThreeResponses(subjResponse);
                        } else {
                            let x1 = subjResponse[0].cx;
                            let x2 = trial.stimulus.x[trial.dot_to_guess];
                            let y1 = subjResponse[0].cy;
                            let y2 = trial.stimulus.y[trial.dot_to_guess];

                            // let RT = subjResponse[0].timeInterval;

                            // error = pointDistanceSq(x1, x2, y1, y2);
                            error = angleDiff(x1, x2, y1, y2);
                        };

                        showFeedback();

                        jsPsych.pluginAPI.setTimeout(function () {
                            submit();
                        }, trial.feedback_duration);

                    });
                };

            };

            let orderedResp = [];
            let error = 0;

            const showFeedback = function () {
                // hide the submit button initially.
                $("#submit-container").css('visibility', 'hidden');

                // Show feedback in green 
                let feedbackPoints = null;
                if (trial.treatment) {
                    feedbackPoints = s.g(
                        s.circle(trial.stimulus.x[0], trial.stimulus.y[0], 3 * scale_factor),
                        s.circle(trial.stimulus.x[1], trial.stimulus.y[1], 3 * scale_factor),
                        s.circle(trial.stimulus.x[2], trial.stimulus.y[2], 3 * scale_factor),
                    );
                } else {
                    let respDot = trial.dot_to_guess;
                    feedbackPoints = s.g(
                        s.circle(trial.stimulus.x[respDot], trial.stimulus.y[respDot], 3 * scale_factor ),
                    )
                }

                let acceptableError = 0;
                if (trial.treatment) {
                    acceptableError = 3000;
                } else {
                    acceptableError = 15; //degree
                }

                if (error < acceptableError) {
                    feedbackPoints.attr({
                        fill: "#009c00"
                    })
                } else {
                    feedbackPoints.attr({
                        fill: "#9c0000"
                    })
                }

                feedbackPoints.transform(translation);

                // show progress
                const progressBar = s.text(-50, 50, `${trial.progress_curr}/${trial.progress_total} finished`); // Origionaly y=200
                // progressBar.attr({"text-anchor": "middle"})
                progressBar.transform(translation);

            }

            const orderThreeResponses = function (subjResponse) {
                const r1 = subjResponse[0];
                const rStim = subjResponse[1];
                const r2 = subjResponse[2];

                const orders = [
                    [r1, rStim, r2],
                    [r1, r2, rStim],
                    [rStim, r1, r2],
                    [rStim, r2, r1],
                    [r2, r1, rStim],
                    [r2, rStim, r1],
                ]
                let currMin = Number.MAX_SAFE_INTEGER;
                let currOrder = [];

                for (let i = 0; i < orders.length; i++) {
                    let error = errorSq(orders[i]);

                    if (error < currMin) {
                        currOrder = orders[i];
                        currMin = error;
                    }
                }

                return [currOrder, currMin];
            }

            const errorSq = function (sequence) {
                const stimX = trial.stimulus.x;
                const stimY = trial.stimulus.y;

                let distSq = 0;

                for (let i = 0; i < 3; i++) {
                    distSq += pointDistanceSq(sequence[i].cx, stimX[i], sequence[i].cy, stimY[i]);
                }

                return distSq;
            }

            const pointDistanceSq = function (x1, x2, y1, y2) {

                return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
            }

            const angleDiff = function (x1, x2, y1, y2) {
                // recover angle info for err calculation
                angle1 = Snap.atan(y1 / x1);
                // to the range of -pi,pi instead of -+pi/2
                if (x1 < 0 && y1 >= 0) {
                    angle1 += 180;
                }
                if (x1 < 0 && y1 < 0) {
                    angle1 -= 180;
                }
                angle2 = Snap.atan(y2 / x2);
                if (x2 < 0 && y2 >= 0) {
                    angle2 += 180;
                }
                if (x2 < 0 && y2 < 0) {
                    angle2 -= 180;
                }

                anglediff = Math.abs(angle1-angle2);
                if (anglediff > 180) {
                    anglediff = 360-anglediff;
                }

                return anglediff
            }

            const submit = function () {
                // console.log("submit!");
                console.log("submit! Error: "+error);
                // kill any remaining setTimeout handlers
                jsPsych.pluginAPI.clearAllTimeouts();

                // gather the data to store for the trial
                const trialData = {
                    'angle': trial.angle,
                    'wedge_degrees': trial.wedge_degrees,
                    'radius': trial.radius,
                    'condition': trial.condition,
                    'clicked_points': orderedResp,
                    'errSq': error,
                    'stimulus_x': trial.stimulus.x,
                    'stimulus_y': trial.stimulus.y,
                    'stimulus_deg': trial.stimulus.deg,
                    'dot_to_guess': trial.dot_to_guess,
                    'width': trial.width,
                    'height': trial.height,
                    'scale_factor': scale_factor,
                    // accumulated time for timeouts, instructions, fixations etc.
                    'trial_fixed_duration': 2500.0
                };

                // clear the display
                displayElement.innerHTML = '';

                // move on to the next trial
                jsPsych.finishTrial(trialData);
            }

            s.mousemove(mouseMoveHandler);
            s.mousedown(clickHandler)
        }

        // ------------------------------------------------------------------------------
        // begin the sequence of stimuli frames, which works like a finite state machine,
        // where each frame transition to the next one on triggering conditions.
        // ------------------------------------------------------------------------------
        showFixation();
    };

    return plugin;
})();
