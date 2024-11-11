// Dynamic counter function
function updateNumber() {
    const startNumber = 30000;
    const endNumber = 75000;
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
    const currentTime = new Date();

    const totalMillisInDay = endOfDay - startOfDay;
    const millisSinceStartOfDay = currentTime - startOfDay;
    const proportionOfDayPassed = millisSinceStartOfDay / totalMillisInDay;

    const currentNumber = Math.floor(startNumber + (endNumber - startNumber) * proportionOfDayPassed);
    document.getElementById('dynamic-number').innerText = currentNumber.toLocaleString();
}

// Age calculation function
function calculateAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
}

function updateURL() {
    var zipCode = $(".zip_code").val();
    var insurance_status = $(".insurance_status").val();
    var insuranceCompany = $("#insuranceCompany").val();
    var birthdate = $(".dob_input").val();

    let dateParam = birthdate;
    let cleanedDate = dateParam.replace(/\+/g, ' ').replace(/%2F/g, '/');
    let dateParts = cleanedDate.split(' / ');

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('zipcode', zipCode);
    
    // Update insurance status handling
    if (insurance_status === "no") {
        currentUrl.searchParams.set('is_insured', 'UNKNOWN');
    } else if (insurance_status === "yes" && insuranceCompany) {
        currentUrl.searchParams.set('is_insured', insurance_status);
        currentUrl.searchParams.set('insurance_company', insuranceCompany);
    }

    if (dateParts.length === 3) {
        // Format date and calculate age
        let month = dateParts[0].padStart(2, '0');
        let day = dateParts[1].padStart(2, '0');
        let year = dateParts[2];
        let formattedDate = `${year}-${month}-${day}`;
        
        // Calculate age
        const birthDate = new Date(year, month - 1, day);
        const age = calculateAge(birthDate);
        
        // Add to URL parameters
        currentUrl.searchParams.set('birth_date', formattedDate);
        currentUrl.searchParams.set('age', age);
    }

    window.history.pushState({}, '', currentUrl);
}

// Timer function
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    let countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            clearInterval(countdown);
        }
    }, 1000);
    return countdown;
}

// Initialize dynamic counter
updateNumber();
setInterval(updateNumber, 60000);

// Main document ready function
$(document).ready(function () {
    // ZIP code input handling
    $(".zip_code").on("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        if (this.value.length > 0) {
            $(this).removeClass("error-border");
            $(".zip-error").hide();
        }
    });

    // ZIP code validation and next step
    $(".zip-btn").on("click", function () {
        let zipCode = $(".zip_code").val();
        if (zipCode.length === 5) {
            $(".zip_code").removeClass("error-border");
            $(".zip-error").hide();
            $(this).closest(".banner__box_bottom").hide().next(".banner__box_bottom").css("display", "inline-block");
        } else {
            $(".zip_code").addClass("error-border");
            $(".zip-error").show();
        }
    });

    // Insurance status handling
    $(".insured-btn-yes").click(function () {
        $(".insurance_status").val("yes");
        $(this).closest(".banner__box_bottom").hide();
        $(".banner__box_bottom:has(#insuranceCompany)").css("display", "inline-block");
    });

    $(".insured-btn-no").click(function () {
        $(".insurance_status").val("no");
        $(this).closest(".banner__box_bottom").hide();
        $(".banner__box_bottom:has(.dob_input)").css("display", "inline-block");
    });

    // Insurance company selection
    $(".company-continue").click(function() {
        const selectedCompany = $("#insuranceCompany").val();
        if (selectedCompany) {
            $("#insuranceCompany").removeClass("error-border");
            $(".company-error").hide();
            $(this).closest(".banner__box_bottom").hide();
            $(".banner__box_bottom:has(.dob_input)").css("display", "inline-block");
        } else {
            $("#insuranceCompany").addClass("error-border");
            $(".company-error").show();
        }
    });

    // DOB input formatting
    $(".dob_input").on("input", function () {
        let input = this.value.replace(/\D/g, "").slice(0, 8);

        if (input.length > 2 && input.length <= 4) {
            input = input.slice(0, 2) + " / " + input.slice(2);
        } else if (input.length > 4) {
            input = input.slice(0, 2) + " / " + input.slice(2, 4) + " / " + input.slice(4);
        }

        this.value = input;

        if (this.value.length === 14) {
            $(this).removeClass("error-border");
            $(".dob-error").hide();
        }
    });

    // Combined DOB validation and final step handler with congratulations postback
    $(".dob-btn").on("click", function () {
        const dobValue = $(".dob_input").val();
        const dobRegex = /^(0[1-9]|1[0-2]) \/ (0[1-9]|[12][0-9]|3[01]) \/ \d{4}$/;

        if (dobRegex.test(dobValue)) {
            $(".dob_input").removeClass("error-border");
            $(".dob-error").hide();
            $(this).closest(".banner__box_bottom").hide().next(".banner__box_bottom").css("display", "inline-block");

            // Update URL with all collected data
            updateURL();

            // Show loader then congratulations
            setTimeout(function () {
                $(".loader").hide();
                $(".congrats").fadeIn();
                // Start 2-minute countdown
                startTimer(120, $(".timer"));
                // Fire the congratulations pixel
                fireCongrtsPostback();
            }, 1500);
        } else {
            $(".dob_input").addClass("error-border");
            $(".dob-error").show();
        }
    });
});