/**
 *
                  888                   888    d8b
                  888                   888    Y8P
                  888                   888
 .d8888b  8888b.  888  .d88b.  88888b.  888888 888 88888b.d88b.
d88P"        "88b 888 d8P  Y8b 888 "88b 888    888 888 "888 "88b
888      .d888888 888 88888888 888  888 888    888 888  888  888
Y88b.    888  888 888 Y8b.     888  888 Y88b.  888 888  888  888
 "Y8888P "Y888888 888  "Y8888  888  888  "Y888 888 888  888  888

 *
 * @name: calentim - the date/time range picker
 * @description: An inline/popup date/time range picker
 * @version: 1.1.0
 * @author: Taha PAKSU <tpaksu@gmail.com>
 *
 * // changelog
 *
 * v1.0.0
 * ------
 * - released first version
 *
 * v1.0.1
 * ------
 * - fixed minute step overflow error on last step range
 * - fixed ineffective initial value on `startEmpty: true` setting
 * - fixed parameterless hideDropdown call bug in firefox
 * - fixed multiple instance closing issues
 * - added option to remove time pickers (`showTimePickers`)
 * - added infinite scroll on timepickers
 *
 * v1.0.2
 * ------
 * - fixed target element confusion when different target option is specified
 * - added `showCalendars` option to disable date selection (only time picker)
 *
 * v1.1.0
 * ------
 * - fixed an issue about time pickers setting the wrong value on first click
 * - fixed autoCloseOnSelect on singleDate version / mobile views
 * - changed code to make clicking on disabled days select start/end date
 * - added some transition delays to make it smoother
 * - added keyboard navigation (`enableKeyboard` option)
 *      up: previous week
 *      down: next week
 *      left: previous day
 *      right: next day
 *      space: select day
 *      pageup: previous month
 *      pagedown next month
 *      shift + pageup: previous year
 *      shift + pagedown: next year
 * - added easy year switch buttons on year list
 * - fixed startEmpty cell selected classes
 * - added destroy method and some extra tests
 * - fix custom target element reading in fetchInputs method
 *
 * v1.1.1
 * ------
 * - fixed the month change problem which is caused by a reset when validating dates.
 *
 * Usage:
 * ------
 * $(".selector").calentim({options});
 */
;
( function( $, window, document, undefined ) {
    /**
     *  The main calentim class
     *  @class calentim
     */
    var calentim = function( elem, options ) {
        this.elem = elem;
        this.$elem = $( elem );
        this.options = options;
        this.metadata = this.$elem.data( "plugin-options" );
    };
    /**
     * Prototype of calentim plugin
     * @prototype
     */
    calentim.prototype = {
        /////////////////////////////////////////////////////////////////////
        // public properties that can be set through plugin initialization //
        /////////////////////////////////////////////////////////////////////
        public: {
            startDate: moment(), // the selected start date, initially today
            endDate: moment(), // the selected end date, initially today
            format: "L LT", // the default format for showing in input, default short date format of locale
            dateSeparator: " - ", // if not used as a single date picker, this will be the seperator
            calendarCount: 2, // how many calendars will be shown in the plugin screen
            inline: false, // display as an inline input replacement
            minDate: null, // minimum selectable date, default null (no minimum)
            maxDate: null, // maximum selectable date, default null (no maximum)
            showHeader: true, // visibility of the part which displays the selected start and end dates
            showFooter: true, // visibility of the part which contains user defined ranges
            showTimePickers: true, // visibility of the time pickers
            showCalendars: true, // visibility of the calendars
            hourFormat: 12, // 12 or 24 hour format
            minuteSteps: 1, // minute increase steps
            startOnMonday: false, // if you want to start the calendars on monday, set this to true
            container: "body", // the container of the dropdowns
            oneCalendarWidth: 230, // the width of one calendar, if two calendars are shown, the input width will be 2 * this setting.
            enableKeyboard: true,
            showOn: "bottom", // or "top"           // dropdown placement position relative to input element
            locale: moment.locale(), // moment locale setting, different inputs: https://momentjs.com/docs/#/i18n/changing-locale/ , available locales: https://momentjs.com/ (bottom of the page)
            singleDate: false, // if you want a single date picker, set this to true
            target: null, // the element to update after selection, defaults to the element that is instantiated on
            autoCloseOnSelect: false,
            startEmpty: false,
            ranges: [ { // default range objects array, one range is defined like : {title(string), startDate(moment object), endDate(moment object) }
                title: "Today",
                startDate: moment().startOf( "day" ),
                endDate: moment().endOf( "day" )
            }, {
                title: "3 Days",
                startDate: moment().startOf( "day" ),
                endDate: moment().add( 2, "days" ).endOf( "day" )
            }, {
                title: "5 Days",
                startDate: moment().startOf( "day" ),
                endDate: moment().add( 4, "days" ).endOf( "day" )
            }, {
                title: "1 Week",
                startDate: moment().startOf( "day" ),
                endDate: moment().add( 6, "days" ).endOf( "day" )
            }, {
                title: "Till Next Week",
                startDate: moment().startOf( "day" ),
                endDate: moment().endOf( "week" ).endOf( "day" ) // if you use Monday as week start, you should use "isoweek" instead of "week"
            }, {
                title: "Till Next Month",
                startDate: moment().startOf( "day" ),
                endDate: moment().endOf( "month" ).endOf( "day" )
            } ],
            rangeLabel: "Ranges: ", // the title of defined ranges
            cancelLabel: "Cancel",
            applyLabel: "Apply",
            onbeforeselect: function() {
                return true;
            }, // event which is triggered before selecting the end date ( a range selection is completed )
            onafterselect: function() {}, // event which is triggered after selecting the end date ( the input value changed )
            onbeforeshow: function() {}, // event which is triggered before showing the dropdown
            onbeforehide: function() {}, // event which is triggered before hiding the dropdown
            onaftershow: function() {}, // event which is triggered after showing the dropdown
            onafterhide: function() {}, // event which is triggered after hiding the dropdown
            onfirstselect: function() {}, // event which is triggered after selecting the first date of ranges
            onrangeselect: function() {}, // event which is triggered after selecting a range from the defined range links
            onbeforemonthchange: function() {
                return true;
            }, // event which fires before changing the first calendar month of multiple calendars, or the month of a single calendar
            onaftermonthchange: function() {}, // event which fires after changing the first calendar month of multiple calendars, or the month of a single calendar
            ondraw: function() {},
            oninit: function() {},
            disableDays: function() {
                return false;
            },
            disabledRanges: [],
            continuous: false,
            enableMonthSwitcher: true,
            enableYearSwitcher: true
        },
        //////////////////////////////////////////
        // private variables for internal usage //
        //////////////////////////////////////////
        private: {
            startSelected: false,
            currentDate: moment(),
            endSelected: true,
            hoverDate: null,
            keyboardHoverDate: null,
            headerStartDay: null,
            headerStartDate: null,
            headerStartWeekday: null,
            headerEndDay: null,
            headerEndDate: null,
            headerEndWeekday: null,
            swipeTimeout: null,
            isMobile: false,
            valElements: [ "BUTTON", "OPTION", "INPUT", "LI", "METER", "PROGRESS", "PARAM" ],
            dontHideOnce: false,
            initiator: null,
            initComplete: false,
            startDateBackup: null,
	        firstValueSelected: false,
            startDateInitial: null,
            endDateInitial: null,
            startScrolling: false,
            lastScrollDirection: "bottom",
            throttleTimeout: null,
	        documentEvent: null
        },
        /**
         * initialize the plugin
         * @return calentim object
         */
        init: function() {
            this.config = $.extend( {}, this.public, this.options, this.metadata );
            this.globals = $.extend( {}, this.private );
            this.globals.isMobile = this.checkMobile();
            this.applyConfig();
            this.fetchInputs();
            this.drawUserInterface();
            this.addInitialEvents();
            this.addKeyboardEvents();
            this.$elem.data( "calentim", this );
            this.config.oninit( this );
            this.globals.initComplete = true;
            return this;
        },
        /**
         * validates start and end dates,
         * swaps dates if end > start,
         * sets visible month of first selection
         *
         * @return void
         */
        validateDates: function() {
            // validate start & end dates
            if(this.config.singleDate === false){
                var swap;
                if ( moment( this.config.startDate ).locale( this.config.locale ).isValid() && moment( this.config.endDate ).locale( this.config.locale ).isValid() ) {
                    this.config.startDate = moment( this.config.startDate ).locale( this.config.locale );
                    this.config.endDate = moment( this.config.endDate ).locale( this.config.locale );
                    if ( this.config.startDate.isAfter( this.config.endDate ) ) {
                        swap = this.config.startDate.clone();
                        this.config.startDate = this.config.endDate.clone();
                        this.config.endDate = swap.clone();
                        swap = null;
                    }
                } else {
                    this.config.startDate = moment();
                    this.config.endDate = moment();
                }
            }else{
                if(moment( this.config.startDate ).locale( this.config.locale ).isValid() === false){
                    this.config.startDate = moment();
                }
            }

            // validate min & max dates
            if ( this.config.minDate !== null && moment( this.config.minDate ).locale( this.config.locale ).isValid() ) {
                this.config.minDate = moment( this.config.minDate ).locale( this.config.locale );
            } else {
                this.config.minDate = null;
            }
            if ( this.config.maxDate !== null && moment( this.config.maxDate ).locale( this.config.locale ).isValid() ) {
                this.config.maxDate = moment( this.config.maxDate ).locale( this.config.locale );
            } else {
                this.config.maxDate = null;
            }
            if ( this.config.minDate !== null && this.config.maxDate !== null && this.config.minDate.isAfter( this.config.maxDate ) ) {
                swap = this.config.minDate.clone();
                this.config.minDate = this.config.maxDate.clone();
                this.config.maxDate = swap.clone();
                swap = null;
            }
            if(this.checkRangeContinuity() === false || this.isDisabled(this.config.startDate) || (this.config.singleDate === false && this.isDisabled(this.config.endDate))){
                this.config.startEmpty = true;
                this.globals.firstValueSelected = false;
                this.config.startDate = null;
                this.config.endDate = null;
                if ( $.inArray( this.config.target.get( 0 ).tagName, this.globals.valElements ) !== -1 ) {
                    this.config.target.val("");
                } else {
                    this.config.target.text("");
                }
            }
        },
        /**
         * sets config variables and relations between them,
         * for example "inline" property converts the input to hidden input,
         * applies default date from input to plugin and vice versa .. etc.
         *
         * @return void
         */
        applyConfig: function() {
            // set global moment.js locale
            moment.locale( this.config.locale );
            // set target element to be updated
            if ( this.config.target === null ) this.config.target = this.$elem;
            // create container relative to environment and settings
            if ( this.globals.isMobile === false ) {
                if ( this.config.inline === true ) {
                    this.container = this.$elem.wrapAll( "<div class='calentim-container calentim-inline' tabindex='1'></div>" ).parent();
                    this.input = $( "<div class='calentim-input'></div>" ).appendTo( this.container );
                    this.elem.type = "hidden";
                } else {
                    this.container = $( "<div class='calentim-container calentim-popup'><div class='calentim-box-arrow-top'></div></div>" ).appendTo( this.config.container );
                    this.input = $( "<div class='calentim-input'></div>" ).appendTo( this.container );
                    this.container.hide();
                }
                this.input.css( "width", ( this.config.calendarCount * this.config.oneCalendarWidth ) + "px" );
                if ( this.config.inline === false ) {
                    this.setViewport();
                }
            } else {
                //this.config.calendarCount = 1;
                this.container = $( "<div class='calentim-container-mobile'></div>" ).appendTo( this.config.container );
                this.input = $( "<div class='calentim-input'></div>" ).appendTo( this.container );
                this.input.hide();
                // disable the soft keyboard on mobile devices
                this.$elem.on( "focus", function() {
                    $( this ).blur();
                } );
            }
        },
        /**
         * Parse input from the source element's value and apply to config
         * @return void
         */
        fetchInputs: function() {
            moment.locale( this.config.locale );
            var elValue = null;
            if ( $.inArray( this.config.target.get(0).tagName, this.globals.valElements ) !== -1 ) {
                elValue = this.config.target.val();
            } else {
                elValue = this.config.target.text();
            }
            if ( this.config.singleDate === false && elValue.indexOf( this.config.dateSeparator ) > 0 ) {
                var parts = elValue.split( this.config.dateSeparator );
                if ( parts.length == 2 ) {
                    if ( moment( parts[ 0 ], this.config.format ).isValid() && moment( parts[ 1 ], this.config.format ).isValid() ) {
                        this.config.startDate = moment( parts[ 0 ], this.config.format );
                        this.config.endDate = moment( parts[ 1 ], this.config.format );
                    }
                }
            } else if ( this.config.singleDate === true ) {
                var value = elValue;
                if ( moment( value, this.config.format ).isValid() ) {
                    this.config.startDate = moment( value, this.config.format );
                    this.config.endDate = moment( value, this.config.format );
                }
            }
            // validate inputs
            this.validateDates();
        },
        /**
         * Draws the plugin interface when needed
         * @return void
         */
        drawUserInterface: function() {
            this.drawHeader();
            if(this.config.showCalendars == true){
                this.calendars = this.input.find( ".calentim-calendars" ).first();
                var nextCal = this.globals.currentDate.clone();
                for ( var calendarIndex = 0; calendarIndex < this.config.calendarCount; calendarIndex++ ) {
                    this.drawCalendarOfMonth( nextCal );
                    nextCal = nextCal.month( nextCal.month() + 1 );
                }
                // remove last border
                this.calendars.find( ".calentim-calendar" ).last().addClass( "no-border-right" );
                this.drawArrows();
            }
            this.drawTimePickers();
            this.drawFooter();
            this.reDrawCells();
            if ( this.globals.isMobile === true || this.config.inline === false ) {
                this.setViewport();
            } else {
                this.fetchTimePickerValues();
            }
            this.updateInput( false );
        },
        /**
         * Draws the header part of the plugin, which contains start and end date displays
         * @return nothing
         */
        drawHeader: function() {
            var headers = "<div class='calentim-header'>" + "<div class='calentim-header-start'>" + "<div class='calentim-header-start-day'></div>" + "<div class='calentim-header-start-date'></div>" + "<div class='calentim-header-start-weekday'></div>" + "</div>";
            if ( this.config.singleDate === false ) {
                headers += "<div class='calentim-header-separator'><i class='fa fa-chevron-right'></i></div>" + "<div class='calentim-header-end'>" + "<div class='calentim-header-end-day'></div>" + "<div class='calentim-header-end-date'></div>" + "<div class='calentim-header-end-weekday'></div>" + "</div>";
            }
            headers += "</div><div class='calentim-calendars'></div>";
            this.input.append( headers );
            if ( this.config.showHeader === false || this.config.showCalendars === false) {
                this.input.find( ".calentim-header" ).hide();
            }
            this.globals.headerStartDay = this.input.find( ".calentim-header-start-day" );
            this.globals.headerStartDate = this.input.find( ".calentim-header-start-date" );
            this.globals.headerStartWeekday = this.input.find( ".calentim-header-start-weekday" );
            this.globals.headerEndDay = this.input.find( ".calentim-header-end-day" );
            this.globals.headerEndDate = this.input.find( ".calentim-header-end-date" );
            this.globals.headerEndWeekday = this.input.find( ".calentim-header-end-weekday" );
            this.updateHeader();
        },
        /**
         * Updates the start and end dates in the header
         * @return void
         */
        updateHeader: function() {
            if ( this.config.startDate !== null ) {
                this.globals.headerStartDay.text( this.config.startDate.date() );
                if ( this.globals.isMobile ) this.globals.headerStartDate.text( moment.monthsShort( this.config.startDate.month() ) + " " + this.config.startDate.year() );
                else this.globals.headerStartDate.text( moment.months( this.config.startDate.month() ) + " " + this.config.startDate.year() );
                this.globals.headerStartWeekday.text( moment.weekdays( this.config.startDate.day() ) );
            } else {
                this.globals.headerStartDay.text( "" );
                this.globals.headerStartDate.text( "" );
                this.globals.headerStartWeekday.text( "" );
            }
            if ( this.config.singleDate === false ) {
                if ( this.config.endDate !== null ) {
                    this.globals.headerEndDay.text( this.config.endDate.date() );
                    if ( this.globals.isMobile ) this.globals.headerEndDate.text( moment.monthsShort( this.config.endDate.month() ) + " " + this.config.endDate.year() );
                    else this.globals.headerEndDate.text( moment.months( this.config.endDate.month() ) + " " + this.config.endDate.year() );
                    this.globals.headerEndWeekday.text( moment.weekdays( this.config.endDate.day() ) );
                } else {
                    this.globals.headerEndDay.text( "" );
                    this.globals.headerEndDate.text( "" );
                    this.globals.headerEndWeekday.text( "" );
                }
            }
        },
        /**
         * Updates the connected input element value when the value is chosen
         * @return void
         */
        updateInput: function( withEvents ) {
            if ( this.config.startEmpty && !this.globals.firstValueSelected ){
                return;
            }
            if ( this.config.singleDate === true ) {
                if ( this.config.startDate === null ) return;
            } else {
                if ( this.config.startDate === null || this.config.endDate === null ) return;
            }
            this.updateTime();
            if ( $.inArray( this.config.target.get(0).tagName, this.globals.valElements ) !== -1 ) {
                if ( this.config.singleDate === false ) this.config.target.val( this.config.startDate.locale( this.config.locale ).format( this.config.format ) + this.config.dateSeparator + this.config.endDate.locale( this.config.locale ).format( this.config.format ) );
                else this.config.target.val( this.config.startDate.locale( this.config.locale ).format( this.config.format ) );
            } else {
                if ( this.config.singleDate === false ) this.config.target.text( this.config.startDate.locale( this.config.locale ).format( this.config.format ) + this.config.dateSeparator + this.config.endDate.locale( this.config.locale ).format( this.config.format ) );
                else this.config.target.text( this.config.startDate.locale( this.config.locale ).format( this.config.format ) );
            }
            if ( this.globals.initComplete === true && withEvents === true ) this.config.onafterselect( this, this.config.startDate, this.config.endDate );

        },
        /**
         * Draws the arrows of the month switcher
         * @return void
         */
        drawArrows: function() {
            if ( this.container.find( ".calentim-title" ).length > 0 ) {
                if ( this.globals.isMobile ) {
                    this.container.find( ".calentim-title" ).prepend( "<div class='calentim-prev'><i class='fa fa-arrow-left'></i></div>" );
                    this.container.find( ".calentim-title" ).append( "<div class='calentim-next'><i class='fa fa-arrow-right'></i></div>" );
                } else {
                    this.container.find( ".calentim-title" ).first().prepend( "<div class='calentim-prev'><i class='fa fa-arrow-left'></i></div>" );
                    this.container.find( ".calentim-title" ).last().append( "<div class='calentim-next'><i class='fa fa-arrow-right'></i></div>" );
                }
            }
        },
        /**
         * Draws a single calendar
         * @param  [moment object] _month: The moment object containing the desired month, for example given "18/02/2017" as moment object draws the calendar of February 2017.
         * @return void
         */
        drawCalendarOfMonth: function( _month ) {
            moment.locale( this.config.locale );
            var startOfWeek = moment.localeData( this.config.locale ).firstDayOfWeek();
            var calendarStart = moment( _month ).startOf( "month" ).subtract( 1, "day" ).endOf( "month" ).startOf( "week" );
            if ( startOfWeek == 1 && this.config.startOnMonday === false ) {
                calendarStart.subtract( 1, "days" );
                startOfWeek = 0;
            } else if ( startOfWeek === 0 && this.config.startOnMonday === true ) {
                calendarStart.add( 1, "days" );
                startOfWeek = 1;
            }
            var calendarOutput = "<div class='calentim-calendar' data-month='" + _month.month() + "'>";
            var boxCount = 0;
            var monthClass = "",
                yearClass = "";
            if ( this.config.enableMonthSwitcher ) monthClass = " class='calentim-month-switch'";
            if ( this.config.enableYearSwitcher ) yearClass = " class='calentim-year-switch'";

            calendarOutput += "<div class='calentim-title'><span><b" + monthClass + ">" + moment.months( _month.month() ) + "</b>&nbsp;<span" + yearClass + ">" + _month.year() + "</span></span></div>";
            calendarOutput += "<div class='calentim-days-container'>";
            for ( var days = startOfWeek; days < startOfWeek + 7; days++ ) {
                calendarOutput += "<div class='calentim-dayofweek'>" + moment.weekdaysShort( days % 7 ) + "</div>";
            }
            while ( boxCount < 42 ) {
                var cellDate = calendarStart.startOf( 'day' ).unix();
                var cellStyle = ( _month.month() == calendarStart.month() ) ? "calentim-day" : "calentim-disabled";
                calendarOutput += "<div class='" + cellStyle + "' data-value='" + cellDate + "'><span>" + calendarStart.date() + "</span></div>";
                boxCount++;
                calendarStart.add( 1, "days" );
            }
            calendarOutput += "</div>";
            calendarOutput += "</div>";
            this.calendars.append( calendarOutput );
        },
        /**
         * Draws the time pickers on the calendar
         * @return {nothing}
         */
        drawTimePickers: function() {
            this.input.find( ".calentim-timepickers" ).remove();
            this.input.append( "<div class='calentim-timepickers'></div>" );
            this.timepickers = this.input.find( ".calentim-timepickers" );
            if ( !this.config.showTimePickers ) this.timepickers.hide();

            var hourStart = 0;
            var hourEnd = 23;
            var addAMPM = false;
            var AMPM = null;
            if ( this.config.hourFormat == 12 ) {
                hourStart = 1;
                hourEnd = 12;
                addAMPM = true;
            }

            // start time pickers
            var timePicker = $( "<div class='calentim-timepicker calentim-timepicker-start'></div>" ).appendTo( this.timepickers );
            // start time picker hour
            this.addTimePickerHours( timePicker, hourStart, hourEnd );
            this.addTimePickerHourMinuteSeparator( timePicker );
            this.addTimePickerMinutes( timePicker, this.config.minuteSteps );
            if ( addAMPM ) {
                this.addTimePickerAMPM( timePicker );
            }

            if ( this.config.singleDate === false ) {
                // end time pickers
                // end time picker hours
                timePicker = $( "<div class='calentim-timepicker calentim-timepicker-end'></div>" ).appendTo( this.timepickers );
                this.addTimePickerHours( timePicker, hourStart, hourEnd );
                this.addTimePickerHourMinuteSeparator( timePicker );
                this.addTimePickerMinutes( timePicker, this.config.minuteSteps );
                if ( addAMPM ) {
                    this.addTimePickerAMPM( timePicker );
                }
            }
            this.addTimePickerEvents();
            this.fetchTimePickerValues();
        },
        addTimePickerHours: function( container, min, max ) {
            var timePickerHoursWrapper = $( "<div class='calentim-timepicker-hours-wrapper'></div>" ).appendTo( container );
            var timePickerHours = $( "<div class='calentim-timepicker-hours'></div>" ).appendTo( timePickerHoursWrapper );
            var timePickerHoursDOM = "<div class='calentim-hour-selected-prev'>&nbsp;</div>";
            // appending hours
            timePickerHoursDOM += "<div class='calentim-hour-selected'>" + ( "00" + min ).slice( -2 ) + "</div>";
            timePickerHoursDOM += "<div class='calentim-hour-selected-next'>" + ( "00" + ( min + 1 ) ).slice( -2 ) + "</div>";
            timePickerHours.append( timePickerHoursDOM ).data( {
                value: min,
                min: min,
                max: max,
                step: 1
            } );
            $( "<div class='calentim-timepicker-hour-arrows'>" +
                "<div class='calentim-timepicker-hours-up calentim-direction-up'><i class='fa fa-arrow-up'></i></div>" +
                "<div class='calentim-timepicker-hours-down calentim-direction-down'><i class='fa fa-arrow-down'></i></div>" +
                "</div>" ).appendTo( container );
            this.preventParentScroll( timePickerHoursWrapper );
        },
        addTimePickerMinutes: function( container, step ) {
            // start time picker minutes
            var timePickerMinutesWrapper = $( "<div class='calentim-timepicker-minutes-wrapper'></div>" ).appendTo( container );
            var timePickerMinutes = $( "<div class='calentim-timepicker-minutes'></div>" ).appendTo( timePickerMinutesWrapper );
            var timePickerMinutesDOM = "<div class='calentim-minute-selected-prev'>&nbsp;</div>";
            timePickerMinutesDOM += "<div class='calentim-minute-selected'>00</div>";
            timePickerMinutesDOM += "<div class='calentim-minute-selected-next'>01</divided>";
            timePickerMinutes.append( timePickerMinutesDOM ).data( {
                value: 0,
                min: 0,
                max: (59 % step !== 0) ? 59 - (59 % step) : 59,
                step: step
            } );
            $( "<div class='calentim-timepicker-minute-arrows'><div class='calentim-timepicker-minutes-up calentim-direction-up'><i class='fa fa-arrow-up'></i></div>" +
                "<div class='calentim-timepicker-minutes-down calentim-direction-down'><i class='fa fa-arrow-down'></i></div></div>" ).appendTo( container );
            this.preventParentScroll( timePickerMinutesWrapper );
        },
        addTimePickerHourMinuteSeparator: function( container ) {
            $( "<div class='calentim-hour-minute-seperator'>:</div>" ).appendTo( container );
        },
        addTimePickerAMPM: function( container ) {
            var AMPM = $( "<div class='calentim-timepicker-ampm'></div>" ).appendTo( container );
            AMPM.append( "<div class='calentim-timepicker-ampm-am'>AM</div>" );
            AMPM.append( "<div class='calentim-timepicker-ampm-pm'>PM</div>" );
        },
        /**
         * Binds the events on the time picker children
         */
        addTimePickerEvents: function() {
            var that = this;
            // main click event
            var clickEvent = function( element ) {
                var parent = element.parents( ".calentim-timepicker" ).hasClass( "calentim-timepicker-start" ) ? "start" : "end";
                var part = element.hasClass( "calentim-timepicker-minutes-up" ) || element.hasClass( "calentim-timepicker-minutes-down" ) ? "minute" : "hour";
                var direction = element.hasClass( "calentim-timepicker-minutes-up" ) || element.hasClass( "calentim-timepicker-hours-up" ) ? "up" : "down";
                var domnode = that.timepickers.find( ".calentim-timepicker-" + parent + " .calentim-timepicker-" + part + "s" );
                var props = domnode.data();
                if ( props && props.hasOwnProperty( "value" ) ) {
                    switch ( direction ) {
                        case "down":
                            if ( ( props.value + props.step ) > props.max ) props.value = props.min;
                            else props.value += props.step;
                            break;
                        case "up":
                            if ( ( props.value - props.step ) < props.min ) props.value = props.max;
                            else props.value -= props.step;
                            break;
                    }

                    domnode.data( props );
                    domnode.find( ".calentim-" + part + "-selected-prev" ).html( ( props.value - props.step < props.min ) ? ("00" + props.max).slice( -2 ) : ( "00" + ( props.value - props.step ) ).slice( -2 ) );
                    domnode.find( ".calentim-" + part + "-selected" ).text( ( "00" + props.value ).slice( -2 ) );
                    domnode.find( ".calentim-" + part + "-selected-next" ).html( ( props.value + props.step > props.max ) ? ("00" + props.min).slice( -2 ) : ( "00" + ( props.value + props.step ) ).slice( -2 ) );
                    if ( that.input.is( ":visible" ) ) that.updateInput(false);
                }
            };
            // mousedown / click events
            this.timepickers.find( ".calentim-timepicker-minutes-up, .calentim-timepicker-minutes-down, .calentim-timepicker-hours-up, .calentim-timepicker-hours-down" )
                .off( "click.calentim" ).on( "click.calentim", function( e ) {
                    clickEvent( $( this ) );
                } );

            // mouse wheel events
            this.timepickers.find( ".calentim-timepicker-hours-wrapper, .calentim-timepicker-minutes-wrapper" )
                .off( "mousewheel.calentim DOMMouseScroll.calentim" )
                .on( "mousewheel.calentim DOMMouseScroll.calentim", function( e ) {
                    var wheelDelta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
                    if ( wheelDelta / 120 > 0 ) {
                        if ( $( e.currentTarget ).hasClass( "calentim-timepicker-hours-wrapper" ) ) {
                            clickEvent( $( this ).siblings( ".calentim-timepicker-hour-arrows" ).find( ".calentim-timepicker-hours-up" ) );
                        } else if ( $( e.currentTarget ).hasClass( "calentim-timepicker-minutes-wrapper" ) ) {
                            clickEvent( $( this ).siblings( ".calentim-timepicker-minute-arrows" ).find( ".calentim-timepicker-minutes-up" ) );
                        }
                    } else {
                        if ( $( e.currentTarget ).hasClass( "calentim-timepicker-hours-wrapper" ) ) {
                            clickEvent( $( this ).siblings( ".calentim-timepicker-hour-arrows" ).find( ".calentim-timepicker-hours-down" ) );
                        } else if ( $( e.currentTarget ).hasClass( "calentim-timepicker-minutes-wrapper" ) ) {
                            clickEvent( $( this ).siblings( ".calentim-timepicker-minute-arrows" ).find( ".calentim-timepicker-minutes-down" ) );
                        }
                    }
                } );

            // mobile events
            if ( this.globals.isMobile ) {
                this.timepickers.find( ".calentim-timepicker-minutes, .calentim-timepicker-hours" ).each( function() {
                    var hammer = new Hammer( this );
                    hammer.get( 'pan' ).set( {
                        direction: Hammer.DIRECTION_VERTICAL
                    } );
                    hammer.on( "panmove", that.panThrottle( function( e ) {
                        var elem = $( e.target );
                        if ( e.velocityY > 0 ) {
                            if ( elem.hasClass( "calentim-timepicker-hours-wrapper" ) || elem.parents( ".calentim-timepicker-hours-wrapper" ).length > 0 ) {
                                clickEvent( elem.parents( ".calentim-timepicker" ).find( ".calentim-timepicker-hours-up" ) );
                                e.srcEvent.preventDefault();
                            } else if ( elem.hasClass( "calentim-timepicker-minutes-wrapper" ) || elem.parents( ".calentim-timepicker-minutes-wrapper" ).length > 0 ) {
                                clickEvent( elem.parents( ".calentim-timepicker" ).find( ".calentim-timepicker-minutes-up" ) );
                                e.srcEvent.preventDefault();
                            }
                        } else {
                            if ( elem.hasClass( "calentim-timepicker-hours-wrapper" ) || elem.parents( ".calentim-timepicker-hours-wrapper" ).length > 0 ) {
                                clickEvent( elem.parents( ".calentim-timepicker" ).find( ".calentim-timepicker-hours-down" ) );
                                e.srcEvent.preventDefault();
                            } else if ( elem.hasClass( "calentim-timepicker-minutes-wrapper" ) || elem.parents( ".calentim-timepicker-minutes-wrapper" ).length > 0 ) {
                                clickEvent( elem.parents( ".calentim-timepicker" ).find( ".calentim-timepicker-minutes-down" ) );
                                e.srcEvent.preventDefault();
                            }
                        }
                        return false;
                    } ) );
                } );
            }
            // AMPM button events
            this.timepickers.find( ".calentim-timepicker-ampm > div" ).off( "click.calentim" ).on( "click.calentim", function() {
                $( this ).addClass( "calentim-ampm-selected" ).siblings().removeClass( "calentim-ampm-selected" );
                that.updateInput();
            } );

        },
        /**
         * Dynamic delay throttling for mouse pan move event
         * @param  {Function} fn         The function to call
         * @return {nothing}             nothing
         */
        panThrottle: function( fn ) {
            return $.proxy( function() {
                var ctx = this;
                var args = Array.prototype.slice.call( arguments );
                var divisor = Math.ceil( Math.abs( args[ 0 ].deltaY ) / 20 ) || 1; // 20px steps for increasing speed
                if ( this.globals.panScrollPos != divisor ) {
                    fn.apply( ctx, args );
                    this.globals.panScrollPos = divisor;
                }
            }, this );
        },
        /**
         * Code from: https://stackoverflow.com/a/36096145/916000
         * Prevents parent element scrolling on current element's scroll end
         * @param  {jQuery Element} element the scrollable element which you want to be limit it's scroll to it's bounds
         * @return nothing
         */
        preventParentScroll: function( element ) {
            var scroll = function( e ) {
                var delta = ( e.type === "mousewheel" ) ? e.wheelDelta : e.detail * -40;
                if ( delta < 0 && ( this.scrollHeight - this.offsetHeight - this.scrollTop ) <= 0 ) {
                    this.scrollTop = this.scrollHeight;
                    e.preventDefault();
                } else if ( delta > 0 && delta > this.scrollTop ) {
                    this.scrollTop = 0;
                    e.preventDefault();
                }
            };
            element.get( 0 ).addEventListener( "mousewheel", scroll );
            element.get( 0 ).addEventListener( "DOMMouseScroll", scroll );
        },
        /**
         * Triggers the styling update of the time pickers
         * @param  {event object} e the event that triggered the update
         * @return {nothing}
         */
        updateTime: function() {
            var startDate = null;
            var endDate = null;
            if ( this.config.hourFormat == 12 ) {
                var startString = this.timepickers.find( ".calentim-timepicker-start .calentim-hour-selected" ).text() +
                    " " + this.timepickers.find( ".calentim-timepicker-start .calentim-minute-selected" ).text() +
                    " " + this.timepickers.find( ".calentim-timepicker-start .calentim-ampm-selected" ).text();
                startDate = moment( startString, "hh mm a" );
                if(this.config.singleDate === false){
                    var endString = this.timepickers.find( ".calentim-timepicker-end .calentim-hour-selected" ).text() +
                        " " + this.timepickers.find( ".calentim-timepicker-end .calentim-minute-selected" ).text() +
                        " " + this.timepickers.find( ".calentim-timepicker-end .calentim-ampm-selected" ).text();
                    endDate = moment( endString, "hh mm a" );
                }
            } else {
                var startString = this.timepickers.find( ".calentim-timepicker-start .calentim-hour-selected" ).text() +
                    " " + this.timepickers.find( ".calentim-timepicker-start .calentim-minute-selected" ).text();
                startDate = moment( startString, "HH mm" );
                if(this.config.singleDate === false){
                    var endString = this.timepickers.find( ".calentim-timepicker-end .calentim-hour-selected" ).text() +
                        " " + this.timepickers.find( ".calentim-timepicker-end .calentim-minute-selected" ).text();
                    endDate = moment( endString, "HH mm" );
                }
            }
            if ( startDate.isValid() ) {
                this.config.startDate.hours(+startDate.get('hour')).minutes(+startDate.get('minute')).locale(this.config.locale);
            }
            if ( this.config.singleDate === false && endDate.isValid() ) {
                this.config.endDate.hours(+endDate.get('hour')).minutes(+endDate.get('minute')).locale(this.config.locale);
            }
            this.validateDates();
        },
        /**
         * Fetches the time from config and displays on the timepickers
         * @return {nothing}
         */
        fetchTimePickerValues: function() {
            if ( this.timepickers !== undefined && this.config.startDate !== null && this.config.endDate !== null ) {
                var startDate = moment( this.config.startDate ).set( {
                    minute: ( this.config.minuteSteps != 1 ) ?
                        Math.round( this.config.startDate.minutes() / this.config.minuteSteps ) * this.config.minuteSteps : this.config.startDate.minutes()
                } );
                var endDate = moment( this.config.endDate ).set( {
                    minute: ( this.config.minuteSteps != 1 ) ?
                        Math.round( this.config.endDate.minutes() / this.config.minuteSteps ) * this.config.minuteSteps : this.config.endDate.minutes()
                } );
                var startHour = startDate.hours(),
                    endHour = endDate.hours(),
                    startMinute = startDate.minutes(),
                    endMinute = endDate.minutes(),
                    startAMPM = null,
                    endAMPM = null;
                if ( this.config.hourFormat == 12 ) {
                    var startHourFormatted = startDate.format( "hh mm a" ).split( ' ' );
                    startHour = parseInt( startHourFormatted[ 0 ], 10 );
                    startAMPM = startHourFormatted[ 2 ].toLowerCase();
                    var endHourFormatted = endDate.format( "hh mm a" ).split( ' ' );
                    endHour = parseInt( endHourFormatted[ 0 ], 10 );
                    endAMPM = endHourFormatted[ 2 ].toLowerCase();
                }
                this.setStartTimeValue( startHour, startMinute, startAMPM );
                this.setEndTimeValue( endHour, endMinute, endAMPM );
            }
        },
        setStartTimeValue: function( hour, minute, ampm ) {
            var that = this;
            var picker = this.timepickers.find( ".calentim-timepicker-start" );
            var hours = picker.find( ".calentim-timepicker-hours" );
            hours.data( "value", hour );
            var props = hours.data();
            if ( props && props.hasOwnProperty( "value" ) ) {
                hours.find( ".calentim-hour-selected-prev" ).html( ( props.value - props.step < props.min ) ? ( "00" + ( props.max ) ).slice( -2 ) : ( "00" + ( props.value - props.step ) ).slice( -2 ) );
                hours.find( ".calentim-hour-selected" ).text( ( "00" + props.value ).slice( -2 ) );
                hours.find( ".calentim-hour-selected-next" ).html( ( props.value + props.step > props.max ) ? ( "00" + ( props.min ) ).slice( -2 ) : ( "00" + ( props.value + props.step ) ).slice( -2 ) );
            }
            var minutes = picker.find( ".calentim-timepicker-minutes" );
            minutes.data( "value", minute );
            props = minutes.data();
            if ( props && props.hasOwnProperty( "value" ) ) {
                minutes.find( ".calentim-minute-selected-prev" ).html( ( props.value - props.step < props.min ) ? ( "00" + ( props.max ) ).slice( -2 ) : ( "00" + ( props.value - props.step ) ).slice( -2 ) );
                minutes.find( ".calentim-minute-selected" ).text( ( "00" + props.value ).slice( -2 ) );
                minutes.find( ".calentim-minute-selected-next" ).html( ( props.value + props.step > props.max ) ? ( "00" + ( props.min ) ).slice( -2 ) : ( "00" + ( props.value + props.step ) ).slice( -2 ) );
            }
            if ( ampm !== null ) {
                picker.find( ".calentim-ampm-selected" ).removeClass( "calentim-ampm-selected" );
                picker.find( ".calentim-timepicker-ampm-" + ampm ).addClass( "calentim-ampm-selected" );
            }
        },
        setEndTimeValue: function( hour, minute, ampm ) {
            var that = this;
            var picker = this.timepickers.find( ".calentim-timepicker-end" );
            var hours = picker.find( ".calentim-timepicker-hours" );
            hours.data( "value", hour );
            var props = hours.data();
            if ( props && props.hasOwnProperty( "value" ) ) {
                hours.find( ".calentim-hour-selected-prev" ).html( ( props.value - props.step < props.min ) ? ( "00" + ( props.max ) ).slice( -2 ) : ( "00" + ( props.value - props.step ) ).slice( -2 ) );
                hours.find( ".calentim-hour-selected" ).text( ( "00" + props.value ).slice( -2 ) );
                hours.find( ".calentim-hour-selected-next" ).html( ( props.value + props.step > props.max ) ? ( "00" + ( props.min ) ).slice( -2 ) : ( "00" + ( props.value + props.step ) ).slice( -2 ) );
            }
            var minutes = picker.find( ".calentim-timepicker-minutes" );
            minutes.data( "value", minute );
            props = minutes.data();
            if ( props && props.hasOwnProperty( "value" ) ) {
                minutes.find( ".calentim-minute-selected-prev" ).html( ( props.value - props.step < props.min ) ? ( "00" + ( props.max ) ).slice( -2 ) : ( "00" + ( props.value - props.step ) ).slice( -2 ) );
                minutes.find( ".calentim-minute-selected" ).text( ( "00" + props.value ).slice( -2 ) );
                minutes.find( ".calentim-minute-selected-next" ).html( ( props.value + props.step > props.max ) ? ( "00" + ( props.min ) ).slice( -2 ) : ( "00" + ( props.value + props.step ) ).slice( -2 ) );
            }
            if ( ampm !== null ) {
                picker.find( ".calentim-ampm-selected" ).removeClass( "calentim-ampm-selected" );
                picker.find( ".calentim-timepicker-ampm-" + ampm ).addClass( "calentim-ampm-selected" );
            }
        },
        /**
         * Draws the footer of the plugin, which contains range selector links
         * @return void
         */
        drawFooter: function() {
            if ( this.config.singleDate === false && this.config.showFooter === true && this.config.showCalendars === true) {
                this.input.append( "<div class='calentim-ranges'></div>" );
                var ranges = this.input.find( ".calentim-ranges" );
                ranges.append( "<i class='fa fa-retweet'></i><div class='calentim-range-header'>" + this.config.rangeLabel + "</div>" );
                for ( var range_id in this.config.ranges ) {
                    ranges.append( "<div class='calentim-range' data-id='" + range_id + "'>" + this.config.ranges[ range_id ].title + "</div>" );
                }
            }
            if ( this.globals.isMobile ) {
                if ( this.config.singleDate === true || this.config.showFooter === false ) {
                    this.input.append( "<div class='calentim-filler'></div>" );
                }
                this.input.append( "<div class='calentim-footer'></div>" );
                this.footer = this.input.find( ".calentim-footer" );
                this.footer.append( "<button class='calentim-cancel'>" + this.config.cancelLabel + "</button>" );
                this.footer.append( "<button class='calentim-apply'>" + this.config.applyLabel + "</button>" );
            }
        },
        /**
         * Draws next month's calendar (just calls this.reDrawCalendars with an 1 month incremented currentDate)
         * Used in the next arrow click event
         *
         * @return void
         */
        drawNextMonth: function( event ) {
            event = event || window.event;
            event.target = event.target || event.srcElement;
            if ( this.globals.swipeTimeout === null ) {
                var that = this;
                this.globals.swipeTimeout = setTimeout( function() {
                    var scrollBuffer = that.calendars.get( 0 ).scrollTop;
                    if ( that.config.onbeforemonthchange( that, that.globals.currentDate.clone().startOf( "month" ), "next" ) === true ) {
                        that.globals.currentDate.add( 1, "month" );
                        that.reDrawCalendars();
                        that.config.onaftermonthchange( that, that.globals.currentDate.clone().startOf( "month" ) );
                    }
                    that.calendars.get( 0 ).scrollTop = scrollBuffer;
                    that.globals.swipeTimeout = null;
                }, 100 );
            }
            if ( event && typeof event.stopPropagation === "function" ) event.stopPropagation();
        },
        /**
         * Draws previous month's calendar (just calls this.reDrawCalendars with an 1 month decremented currentDate)
         * Used in the prev arrow click event
         *
         * @return void
         */
        drawPrevMonth: function( event ) {
            event = event || window.event;
            event.target = event.target || event.srcElement;
            if ( this.globals.swipeTimeout === null ) {
                var that = this;
                this.globals.swipeTimeout = setTimeout( function() {
                    var scrollBuffer = that.calendars.get( 0 ).scrollTop;
                    if ( that.config.onbeforemonthchange( that, that.globals.currentDate.clone().startOf( "month" ), "prev" ) === true ) {
                        that.globals.currentDate.subtract( 1, "month" );
                        that.reDrawCalendars();
                        that.config.onaftermonthchange( that, that.globals.currentDate.clone().startOf( "month" ) );
                    }
                    that.calendars.get( 0 ).scrollTop = scrollBuffer;
                    that.globals.swipeTimeout = null;
                }, 100 );
            }
            if ( event && typeof event.stopPropagation === "function" ) event.stopPropagation();
        },
        /**
         * Day cell click event handler
         * @param  [event object] e : The event object which contains the clicked cell in e.target property, which enables us to select dates
         * @return void
         */
        cellClicked: function ( e ) {
            e = e || window.event;
            e.target = e.target || e.srcElement;

            if ( $( e.target ).hasClass( "calentim-day" ) === false ) e.target = $( e.target ).closest( ".calentim-day" ).get( 0 );
            var cell = $( e.target ).data( "value" );
            var selectedMoment = moment.unix( cell );
            if ( this.config.singleDate === false ) {
                if ( this.globals.startSelected === false ) {
                    if(this.config.startDate !== null)
                        this.globals.startDateBackup = this.config.startDate.clone();
                    this.config.startDate = selectedMoment;
                    this.config.endDate = null;
                    this.globals.startSelected = true;
                    this.globals.endSelected = false;
                    if ( typeof this.footer != "undefined" ) this.footer.find( ".calentim-apply" ).attr( "disabled", "disabled" );
                    this.config.onfirstselect( this, this.config.startDate );
                } else {
                    if ( selectedMoment.isBefore( this.config.startDate ) ) {
                        var start = this.config.startDate.clone();
                        this.config.startDate = selectedMoment.clone();
                        selectedMoment = start;
                    }
                    this.globals.startDateBackup = null;
                    this.config.endDate = selectedMoment;
                    this.globals.endSelected = true;
                    this.globals.startSelected = false;
                    this.globals.hoverDate = null;

                    if ( this.config.onbeforeselect( this, this.config.startDate, this.config.endDate ) === true &&
                        this.checkRangeContinuity() === true ) {
                        this.globals.firstValueSelected = true;
                        this.updateInput( true );
                    }
                    else this.fetchInputs();
                    if ( this.config.autoCloseOnSelect && (this.globals.isMobile === true || this.config.inline === false) ) this.hideDropdown( e );
                    if ( typeof this.footer != "undefined" ) this.footer.find( ".calentim-apply" ).removeAttr( "disabled" );
                }
            } else {
                this.config.startDate = selectedMoment;
                this.config.endDate = selectedMoment;
                this.globals.endSelected = true;
                this.globals.startSelected = false;
                this.globals.hoverDate = null;
                if ( this.config.onbeforeselect( this, this.config.startDate, this.config.endDate ) === true ) {
                    this.globals.firstValueSelected = true;
                    this.updateInput( true );
                } else {
                    this.fetchInputs();
                }
                if ( this.config.autoCloseOnSelect && (this.globals.isMobile === true || this.config.inline === false) ) this.hideDropdown( e );
            }
            this.reDrawCells();
            this.updateHeader();
            if ( e && typeof e.stopPropagation === "function" ) {
                e.stopPropagation();
                e.returnValue = false;
            }
        },
        /**
         * Checks if the defined range is continous (doesn't include disabled ranges or disabled days by callback)
         * @return boolean is continuous or not
         */
        checkRangeContinuity: function() {
            if ( this.config.continuous === false ) {
                return true;
            } else {
                var daysInRange = this.config.endDate.diff( this.config.startDate, "days" );
                var startDate = moment( this.config.startDate );
                for ( var i = 0; i <= daysInRange; i++ ) {
                    if ( $.grep( this.config.disabledRanges, function( e ) {
                            return startDate.isBetween( e.start, e.end, "day", "[]" );
                        } ).length > 0 || this.config.disableDays( startDate ) === true ) {
                        //alert("calentim: Selected range contains disabled days. Reverting selection to previous input. [Selected Range: "+this.config.startDate.format("L") + " - " + this.config.endDate.format("L") + "]");
                        return false;
                    }
                    startDate.add( 1, "days" );
                }
                return true;
            }
        },
        /**
         * Checks if given moment value is disabled for that calendar
         * @param [moment] day : The day to be checked
         * @return [boolean] If the day is disabled or not
         */
        isDisabled: function(day){
            var momentday = moment(day);
            if(this.config.disableDays(momentday.startOf("day")) === true) return true;
            for(var rangeIndex in this.config.disabledRanges){
                var range = this.config.disabledRanges[rangeIndex];
                if(momentday.isBetween(range.start, range.end, "day","[]")) return true;
            }
            return false;
        },
        /**
         * Event triggered when a day is hovered
         * @param  [event object] e : The event object which contains the hovered cell in e.target property, which enables us to style hovered dates
         * @return void
         */
        cellHovered: function( e ) {
            e = e || window.event;
            e.target = e.target || e.srcElement;
            if ( $( e.target ).hasClass( "calentim-day" ) === false ) e.target = $( e.target ).closest( ".calentim-day" ).get( 0 );
            var cell = $( e.target ).data( "value" );
            this.globals.hoverDate = moment.unix( cell );
            this.globals.keyboardHoverDate = null;
            if ( this.globals.startSelected === true ) this.reDrawCells();
            if ( e && typeof e.stopPropagation === "function" ) {
                e.stopPropagation();
                e.returnValue = false;
            }
        },
        /**
         * Just a calendar refresher to be used with the new variables, updating the calendar view
         * @return void
         */
        reDrawCalendars: function() {
            this.input.empty();
            this.drawUserInterface();
            this.container.focus();
        },
        monthSwitchClicked: function () {
            var that = this;
            this.calendars.get( 0 ).scrollTop = 0;
            var monthSelector = $( "<div class='calentim-month-selector'></div>" ).appendTo( this.calendars );
            var currentMonth = this.globals.currentDate.get( 'month' );
            for ( var m = 0; m < 12; m++ ) {
                monthSelector.append( "<div class='calentim-ms-month" + ( ( currentMonth == m ) ? " current" : "" ) + "' data-month='" + m + "'>" + moment.months( m ) + "</div>" );
            }
            monthSelector.fadeIn( 100 ).css( "display", "flex" );
            monthSelector.find( ".calentim-ms-month" ).off( "click" ).on( "click", function ( event ) {
                that.globals.currentDate.set( "month", $( this ).data( "month" ) );
                that.calendars.find( ".calentim-month-selector" ).fadeOut(200,function(){
                    $(this).remove();
                    that.reDrawCalendars();
                });
                event.stopPropagation();
            } );
        },
        yearSwitchClicked: function () {
            var that = this;
            this.calendars.get( 0 ).scrollTop = 0;
            var yearSelector = $( "<div class='calentim-year-selector'></div>" ).appendTo( this.calendars );
            var currentYear = this.globals.currentDate.get( 'year' );
            yearSelector.append( "<div class='calentim-ys-year-prev'><i class='fa fa-angle-double-left'></i></div>" );
            yearSelector.data("year",currentYear);
            for ( var year = currentYear - 6; year < currentYear + 7; year++ ) {
                yearSelector.append( "<div class='calentim-ys-year" + ( ( currentYear == year ) ? " current" : "" ) + "' data-year='" + year + "'>" + year + "</div>" );
            }
            yearSelector.append( "<div class='calentim-ys-year-next'><i class='fa fa-angle-double-right'></i></div>" );
            yearSelector.fadeIn( 100 ).css( "display", "flex" );
            $(document).off( "click.calentimys" ).on( "click.calentimys", ".calentim-ys-year", function ( event ) {
                that.globals.currentDate.set( "year", $( this ).data( "year" ) );
                that.calendars.find( ".calentim-year-selector" ).fadeOut(200,function(){
                    $(this).remove();
                    that.reDrawCalendars();
                });
                event.stopPropagation();
            } );
            $(document).off("click.calentimysprev").on("click.calentimysprev", ".calentim-ys-year-prev", function ( event ) {
                var currentYear = yearSelector.data("year") - 13;
                var currentYearNow = that.globals.currentDate.get( 'year' );
                yearSelector.data("year",currentYear);
                yearSelector.empty();
                yearSelector.append( "<div class='calentim-ys-year-prev'><i class='fa fa-angle-double-left'></i></div>" );
                for ( var year = currentYear - 6; year < currentYear + 7; year++ ) {
                    yearSelector.append( "<div class='calentim-ys-year" + ( ( currentYearNow == year ) ? " current" : "" ) + "' data-year='" + year + "'>" + year + "</div>" );
                }
                yearSelector.append( "<div class='calentim-ys-year-next'><i class='fa fa-angle-double-right'></i></div>" );
                event.stopPropagation();
            });
            $(document).off("click.calentimysnext").on("click.calentimysnext", ".calentim-ys-year-next", function ( event ) {
                var currentYear = yearSelector.data("year") + 13;
                var currentYearNow = that.globals.currentDate.get( 'year' );
                yearSelector.data("year",currentYear);
                yearSelector.empty();
                yearSelector.append( "<div class='calentim-ys-year-prev'><i class='fa fa-angle-double-left'></i></div>" );
                for ( var year = currentYear - 6; year < currentYear + 7; year++ ) {
                    yearSelector.append( "<div class='calentim-ys-year" + ( ( currentYearNow == year ) ? " current" : "" ) + "' data-year='" + year + "'>" + year + "</div>" );
                }
                yearSelector.append( "<div class='calentim-ys-year-next'><i class='fa fa-angle-double-right'></i></div>" );
                event.stopPropagation();
            });
        },
        /**
         * Hides the calentim dropdown
         * @return void
         */
        hideDropdown: function( e ) {
            if ( e !== null ) {
                e = e || window.event;
                e.target = e.target || e.srcElement;
                if ( this.globals.initiator === e.target ) {
                    return;
                }
            }
            if ( this.input.is( ":visible" ) ) {
                this.config.onbeforehide( this );
                if ( this.globals.isMobile ) {
                    this.input.css( {
                        "display": "none"
                    } );
                    $( "body" ).removeClass( "calentim-open" );
                } else {
                    this.container.css( {
                        "display": "none"
                    } );
                }
                this.globals.hoverDate = null;
                if ( this.globals.startDateBackup !== null ) {
                    this.config.startDate = this.globals.startDateBackup;
                    this.globals.startSelected = false;
                }
                this.config.onafterhide( this );
            }
            return false;
        },
        /**
         * Shows the calentim dropdown
         * @return void
         */
        showDropdown: function( e ) {
            e = e || window.event;
            e.target = e.target || e.srcElement;
            if ( !this.input.is( ":visible" ) ) {
                if ( e.target !== this.elem ) {
                    this.globals.dontHideOnce = true;
                    this.globals.initiator = e.target;
                }
                this.fetchInputs();
                if(this.config.startDate !== null) this.globals.startDateInitial = this.config.startDate.clone();
                if(this.config.endDate !== null) this.globals.endDateInitial = this.config.endDate.clone();
                this.reDrawCalendars();
                this.config.onbeforeshow( this );
                if ( this.globals.isMobile ) {
                    this.input.css( {
                        "display": "flex"
                    } );
                    $( "body" ).addClass( "calentim-open" );
                } else {
                    this.container.css( {
                        "display": "block"
                    } );
                }
                this.setViewport();
                this.config.onaftershow( this );
            }
            return false;
        },
        /**
         * When only a cell style update is needed, this function is used. This gives us the possibility to change styles without re-drawing the calendars.
         * @return void
         */
        reDrawCells: function() {
            var that = this;
            var cells = this.container.find( ".calentim-day, .calentim-disabled" );
            for ( var i = 0; i < cells.length; i++ ) {
                var cell = $( cells[ i ] );
                var cellDate = cell.attr( "data-value" );
                var cellMoment = moment.unix( cellDate ).locale( that.config.locale );
                var cellStyle = "calentim-day";
                var cellDay = cellMoment.day();
                // is weekend day (saturday or sunday) check
                if ( cellDay == 6 || cellDay === 0 ) cellStyle += " calentim-weekend";
                // is today check
                if ( moment().isSame( cellMoment, "day" ) ) cellStyle += " calentim-today";
                    if(that.config.startEmpty === false || that.globals.firstValueSelected ){
                    // is the start of the range check
                    if ( that.config.singleDate === false && that.config.startDate !== null && that.config.startDate.isSame( cellMoment, "day" ) ) cellStyle += " calentim-start";
                    // is the end of the range check
                    if ( that.config.singleDate === false && that.config.endDate !== null && that.config.endDate.isSame( cellMoment, "day" ) ) cellStyle += " calentim-end";
                    // is between the start and the end range check
                    if ( that.config.singleDate === false && that.config.startDate !== null && that.config.endDate !== null && cellMoment.isBetween( that.config.startDate, that.config.endDate, 'day', '[]' ) ) cellStyle += " calentim-selected";
                    // is the selected date of single date picker
                    if ( that.config.singleDate === true && that.config.startDate !== null && that.config.startDate.isSame( cellMoment, 'day' ) ) cellStyle += " calentim-selected";
                }
                // hovered date check
                if ( that.globals.startSelected === true && that.globals.endSelected === false && that.globals.hoverDate !== null) {
                    if ( cellMoment.isBetween( that.globals.hoverDate, that.config.startDate, "day", "[]" ) ||
                        (that.globals.hoverDate !== null && cellMoment.isBetween( that.config.startDate, that.globals.hoverDate, "day", "[]" ))) {
                        cellStyle += " calentim-hovered";
                    }
                }
                if(that.config.enableKeyboard == true && that.globals.keyboardHoverDate !== null){
                    if(that.globals.startSelected === false){
                        if(that.globals.keyboardHoverDate.isSame(cellMoment,"day")){
                            cellStyle += " calentim-hovered";
                        }
                    }else{
                        if(cellMoment.isBetween(that.config.startDate, that.globals.keyboardHoverDate, "day", "[]") ||
                        cellMoment.isBetween(that.globals.keyboardHoverDate, that.config.startDate, "day", "[]")){
                            cellStyle += " calentim-hovered";
                        }
                    }
                }
                // check disabling scenarios
                // 1. user defined disabling by array or by callback
                var dayDisabledInPredefinedRange = ( that.config.disabledRanges.length > 0 && $.grep( that.config.disabledRanges, function( e ) {
                    return cellMoment.isBetween( e.start, e.end, "day", "[]" );
                } ).length > 0 ) || that.config.disableDays( cellMoment ) === true;
                if ( dayDisabledInPredefinedRange ||
                    // 3. after the maximum date
                    ( that.config.maxDate !== null && cellMoment.isAfter( that.config.maxDate, 'day' ) ) ||
                    // 4. before the minimum date
                    ( that.config.minDate !== null && cellMoment.isBefore( that.config.minDate, 'day' ) ) ) {
                    cellStyle = "calentim-disabled";
                }else if(cellMoment.month() != cell.closest( ".calentim-calendar" ).data( "month" )){
                    // 2. not the same month of the calendar
                    cellStyle += " calentim-disabled";
                    cellStyle = cellStyle.replace("calentim-weekend","");
                }
                if ( dayDisabledInPredefinedRange ) {
                    cellStyle += " calentim-disabled-range";
                }
                cell.attr( "class", cellStyle );
            };
            this.attachEvents();
            this.config.ondraw( this );
        },
        /**
         * Event triggered when a range link is clicked in the footer of the plugin
         * @param  [event object] e the clicked range link
         * @return void
         */
        rangeClicked: function( e ) {
            e = e || window.event;
            e.target = e.target || e.srcElement;
            if ( $( e.target ).hasClass( "calentim-range" ) === false ) e.target = $( e.target ).closest( ".calentim-range" ).get( 0 );
            if ( !e.target.hasAttribute( "data-id" ) ) return;
            var range_id = $( e.target ).attr( "data-id" );
            this.globals.currentDate = this.config.ranges[ range_id ].startDate.clone().locale( this.config.locale );
            this.config.startDate = this.config.ranges[ range_id ].startDate.clone().locale( this.config.locale );
            this.config.endDate = this.config.ranges[ range_id ].endDate.clone();
            if ( this.checkRangeContinuity() === false ) {
                this.fetchInputs();
            } else {
                this.config.onrangeselect( this, this.config.ranges[ range_id ] );
                this.reDrawCalendars();
                if ( !this.config.inline ) this.setViewport();
            }
            if ( e && typeof e.stopPropagation === "function" ) e.stopPropagation();
        },
        /**
         * Fixes the view positions of dropdown calendar plugin
         * @return void
         */
        setViewport: function() {
            if ( this.globals.isMobile === true ) {
                // divided mode
                $( window ).off( "resize.calentim" ).on( "resize.calentim", $.proxy( function() {
                    if ( $( window ).width() < $( window ).height() ) {
                        // portrait mode
                        this.input.removeClass( "calentim-input-top-reset" );
                        var oneCalendarHeight = this.input.find( ".calentim-calendar:visible:first" ).innerHeight();
                        var containerHeight = this.input.find( ".calentim-calendars" ).height();
                        if ( oneCalendarHeight > containerHeight ) {
                            this.input.find( ".calentim-calendars" ).css( "min-height", oneCalendarHeight );
                        } else {
                            this.input.find( ".calentim-calendars" ).css( "max-height", oneCalendarHeight );
                        }
                        if ( this.input.position().top < 0 ) this.input.addClass( "calentim-input-top-reset" );
                    } else {
                        // landscape mode
                        this.input.find( ".calentim-calendars" ).css( "min-height", "0px" ).css( "max-height", "99999px" );
                    }
                    this.fetchTimePickerValues();
                }, this ) );
                $( window ).resize();
            } else {
                var vp = {
                    top: window.scrollY || window.pageYOffset,
                    left: window.scrollX || window.pageXOffset,
                    bottom: ( window.scrollY || window.pageYOffset ) + window.innerHeight,
                    right: ( window.scrollX || window.pageXOffset ) + window.innerWidth
                };
                var inputdim = this.getDimensions( this.$elem, true );
                var calentimdim = this.getDimensions( this.container, true );
                if ( ( this.config.showOn == "top" && inputdim.offsetTop - calentimdim.height < vp.top ) || ( this.config.showOn != "top" && inputdim.offsetTop + inputdim.height + calentimdim.height < vp.bottom ) ) {
                    // show on bottom
                    this.container.css( "top", inputdim.offsetTop + inputdim.height + 8 );
                    this.container.find( ".calentim-box-arrow-bottom" ).removeClass( "calentim-box-arrow-bottom" ).addClass( "calentim-box-arrow-top" );
                } else {
                    // show on top
                    this.container.css( "top", inputdim.offsetTop - calentimdim.height - 8 );
                    this.container.find( ".calentim-box-arrow-top" ).removeClass( "calentim-box-arrow-top" ).addClass( "calentim-box-arrow-bottom" );
                }
                if ( inputdim.offsetLeft + calentimdim.width > vp.right ) {
                    this.container.css( "left", vp.right - calentimdim.width );
                } else if ( inputdim.offsetLeft < vp.left ) {
                    this.container.css( "left", vp.left );
                } else {
                    this.container.css( "left", inputdim.offsetLeft - 10 );
                }
                this.container.find( ".calentim-box-arrow-top, .calentim-box-arrow-bottom" ).css( "margin-left", inputdim.offsetLeft - parseInt( this.container.css( "left" ), 10 ) );
            }
            this.fetchTimePickerValues();
        },
        /**
         * Helper method for getting an element's inner/outer dimensions and positions
         * @param  [DOM element] elem  The element whose dimensions and position are wanted
         * @param  [boolean]     outer true/false variable which tells the method to return inner(false) or outer(true) dimensions
         * @return [object]      an user defined object which contains the width and height of the element and top and left positions relative to the viewport
         */
        getDimensions: function( elem, outer ) {
            var result = {
                width: ( outer ) ? elem.outerWidth() : elem.innerWidth(),
                height: ( outer ) ? elem.outerHeight() : elem.innerHeight(),
                offsetTop: elem.offset().top,
                offsetLeft: elem.offset().left
            };
            return result;
        },
        /**
         * Attaches the related events on the elements after render/update
         * @return void
         */
        attachEvents: function() {
            var clickNextEvent = $.proxy( this.drawNextMonth, this );
            var clickPrevEvent = $.proxy( this.drawPrevMonth, this );
            var clickCellEvent = $.proxy( this.cellClicked, this );
            var hoverCellEvent = $.proxy( this.cellHovered, this );
            var rangeClickedEvent = $.proxy( this.rangeClicked, this );
            var monthSwitchClickEvent = $.proxy( this.monthSwitchClicked, this );
            var yearSwitchClickEvent = $.proxy( this.yearSwitchClicked, this );
            var clickEvent = "click.calentim";
            this.container.find( ".calentim-next" ).off( clickEvent ).one( clickEvent, clickNextEvent );
            this.container.find( ".calentim-prev" ).off( clickEvent ).one( clickEvent, clickPrevEvent );
            this.container.find( ".calentim-day" ).off( clickEvent ).on( clickEvent, clickCellEvent );
            this.container.find( ".calentim-day" ).off( "mouseover.calentim" ).on( "mouseover.calentim", hoverCellEvent );
            this.container.find( ".calentim-disabled" ).not(".calentim-day").off( clickEvent );
            this.container.find( ".calentim-range" ).off( clickEvent ).on( clickEvent, rangeClickedEvent );
            this.container.find( ".calentim-month-switch " ).off( clickEvent ).on( clickEvent, monthSwitchClickEvent );
            this.container.find( ".calentim-year-switch " ).off( clickEvent ).on( clickEvent, yearSwitchClickEvent );
            if ( this.globals.isMobile === true ) {
                // check if jQuery Mobile is loaded
                if ( typeof $.fn.swiperight === "function" ) {
                    this.input.find( ".calentim-calendars" ).css( "touch-action", "none" );
                    this.input.find( ".calentim-calendars" ).on( "swipeleft", clickNextEvent );
                    this.input.find( ".calentim-calendars" ).on( "swiperight", clickPrevEvent );
                } else {
                    var hammer = new Hammer( this.input.find( ".calentim-calendars" ).get( 0 ) );
                    hammer.off( "swipeleft" ).on( "swipeleft", clickNextEvent );
                    hammer.off( "swiperight" ).on( "swiperight", clickPrevEvent );
                }

                if ( this.globals.isMobile ) {
                    // cancel button click event
                    this.input.find( ".calentim-cancel" ).off( "click.calentim" ).on( "click.calentim", $.proxy( function( event ) {
                        this.config.startDate = this.globals.startDateInitial.clone();
                        this.config.endDate = this.globals.endDateInitial.clone();
                        this.fetchTimePickerValues();
                        this.updateInput( false );
                        this.hideDropdown( event );
                    }, this ) );

                    // apply button click event
                    this.input.find( ".calentim-apply" ).off( "click.calentim" ).on( "click.calentim", $.proxy( function( event ) {
                        this.config.startDate = this.config.startDate || moment();
                        this.config.endDate = this.config.endDate || moment();
                        if ( this.config.onbeforeselect( this, this.config.startDate, this.config.endDate ) === true && this.checkRangeContinuity() === true ) {
                            this.globals.firstValueSelected = true;
                            this.updateInput( true );
                        } else {
                            this.fetchInputs();
                        }
                        this.hideDropdown( event );
                    }, this ) );
                }
            }
        },
        /**
         * Events per instance
         */
        addInitialEvents: function () {
                var eventClick = "click.caleran";
                this.globals.documentEvent = eventClick + "_" + Math.round(new Date().getTime() + (Math.random() * 100));
                $( document ).on(this.globals.documentEvent, $.proxy( function ( event ) {
                if ( this.globals.isMobile === false && this.config.inline === false ) {
                    event = event || window.event;
                    event.target = event.target || event.srcElement;
                    if ( $( this.container ).find( $( event.target ) ).length === 0 &&
                        !$( this.elem ).is( event.target ) && $( this.input ).is( ":visible" ) ) {
                        this.hideDropdown( event );
                    }
                }
            }, this ) );

            if(this.config.enableKeyboard) eventClick = "click.calentim focus.calentim";
            this.$elem.off(eventClick).on( eventClick, $.proxy( this.debounce(function ( event ) {
                event = event || window.event;
                event.target = event.target || event.srcElement;
                if ( $( this.input ).is( ":visible" ) && !$( this.config.target ).is( event.target ) ) {
                    this.hideDropdown( event );
                } else {
                    this.showDropdown( event );
                }
            }, 200, true), this ) );
        },
        debounce: function(func, wait, immediate) {
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    context.globals.throttleTimeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !context.globals.throttleTimeout;
                clearTimeout(context.globals.throttleTimeout);
                context.globals.throttleTimeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },
        /**
         * Attaches keyboard events if enabled
         */
        addKeyboardEvents: function()
        {
            if(this.config.enableKeyboard){
                var keyDownEvent = $.proxy(function(event){
                    var keycode = (event.which) ? event.which : event.keyCode;
                    if(this.globals.keyboardHoverDate === null) {
                        if(this.config.startDate === null){
                            this.globals.keyboardHoverDate = moment({
                                day: 1,
                                month: this.calendars.first().data("month")
                            });
                        }else{
                            this.globals.keyboardHoverDate = this.config.startDate.clone();
                        }
                    }
                    var shouldReDraw = false, shouldPrevent = false;
                    switch(keycode){
                        case 37: // left
                            this.globals.keyboardHoverDate.add(-1,"day");
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 38: // top
                            this.globals.keyboardHoverDate.add(-1,"week");
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 39: // right
                            this.globals.keyboardHoverDate.add(1,"day");
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 40: // bottom
                            this.globals.keyboardHoverDate.add(1,"week");
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 32: // space
                            this.input.find(".calentim-day[data-value='"+this.globals.keyboardHoverDate.startOf("day").unix()+"']").first().trigger("click.calentim");
                            shouldReDraw = false;
                            shouldPrevent = true;
                        break;
                        case 33: // page up
                            if(event.shiftKey) {
                                this.globals.keyboardHoverDate.add(-1,"years");
                            } else {
                                this.globals.keyboardHoverDate.add(-1,"months");
                            }
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 34: // page down
                            if(event.shiftKey) {
                                this.globals.keyboardHoverDate.add(1,"years");
                            } else {
                                this.globals.keyboardHoverDate.add(1,"months");
                            }
                            shouldReDraw = true;
                            shouldPrevent = true;
                        break;
                        case 27: // esc
                        case 9: // tab
                            this.hideDropdown(event);
                        break;
                        case 36:
                            if(event.shiftKey){
                                this.globals.keyboardHoverDate = moment();
                                shouldReDraw = true;
                                shouldPrevent = true;
                            }
                        break;
                    }
                    if(shouldReDraw || shouldPrevent){
                        if(this.globals.keyboardHoverDate.isBefore(moment.unix(this.input.find(".calentim-day:first").attr('data-value')))
                            || this.globals.keyboardHoverDate.isAfter(moment.unix(this.input.find(".calentim-day:last").attr('data-value')))){
                            this.globals.currentDate = this.globals.keyboardHoverDate.clone().startOf("month");
                            this.reDrawCalendars();
                            shouldReDraw = false;
                        }
                        if(shouldReDraw) {
                            this.globals.hoverDate = null;
                            this.reDrawCells();
                        }
                        if (shouldPrevent && event && typeof event.preventDefault === "function" ) event.preventDefault();
                        if (shouldPrevent && event && typeof event.stopPropagation === "function" ) event.stopPropagation();
                        return false;
                    }
                },this);
                this.$elem.off("keydown.calentim").on("keydown.calentim", keyDownEvent);
                this.container.off("keydown.calentim").on("keydown.calentim", keyDownEvent);
            }
        },
        /**
         * Destroys the instance
         */
        destroy: function(){
            if(this.config.inline){
                this.input.remove();
                if(this.globals.isMobile)
                    this.$elem.unwrap(".calentim-container-mobile");
                else
                    this.$elem.unwrap(".calentim-container");
                this.elem.type='text';
            }else{
                this.container.remove();
            }
            $(document).off(this.globals.documentEvent);
            this.$elem.removeData("calentim");
        },
        /**
         * Code from http://detectmobilebrowser.com/
         * Detects if the browser is mobile
         * @return [boolean] if the browser is mobile or not
         */
        checkMobile: function() {
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test( ( navigator.userAgent || navigator.vendor || window.opera ) ) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( ( navigator.userAgent || navigator.vendor || window.opera ).substr( 0, 4 ) );
        }
    };
    calentim.defaults = calentim.prototype.defaults;
    /**
     * The main handler of calentim plugin
     * @param  [object] options javascript object which contains element specific or range specific options
     * @return [calentim] plugin reference
     */
    $.fn.calentim = function( options ) {
        return this.each( function() {
            new calentim( this, options ).init();
        } );
    };
} )( jQuery, window, document );
