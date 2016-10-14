angular.module('de.stekoe.angular.spotlight')
    .provider("AngularSpotlight", function () {
        var _iconConfig = iconConfig();
        var _detailsTemplateConfig = detailsTemplateConfig();
        var _defaultSpotlightConfig = defaultSpotlightConfig();

        this.search = function () {
            throw "You have to implement a search function using AngularSpotlightProvider!";
        };

        this.addIcons = _iconConfig.addIcons;
        this.addTemplates = _detailsTemplateConfig.addTemplates;

        this.addIcons = _iconConfig.addIcons;
        this.addTemplates =  _detailsTemplateConfig.addTemplates;
        this.setSearchInputInfoSearching = _defaultSpotlightConfig.setSearchInputInfoSearching;
        this.setSearchInputInfoNoResults = _defaultSpotlightConfig.setSearchInputInfoNoResults;
        this.setSpotlightPlaceholder = _defaultSpotlightConfig.setSpotlightPlaceholder;
        this.setSpotlightToggleCtrlKey = _defaultSpotlightConfig.setSpotlightToggleCtrlKey;
        this.$get = ['$http', function ($http) {
            var that = this;
            return {
                search: that.search($http),
                getIconDescriptorForType: _iconConfig.getIconForType,
                getTemplateForType: _detailsTemplateConfig.getTemplateForType
            };
        }];

        function iconConfig() {
            var icons = {
                'default': 'fa fa-file'
            };

            function addIcons(iconDescriptors) {
                Object.keys(iconDescriptors)
                    .forEach(function (iconKey) {
                        icons[iconKey.toLowerCase()] = iconDescriptors[iconKey];
                    });
            }

            function getIconForType(type) {
                var icon = icons[(type || 'default').toLowerCase()] || icons['default'];

                return {
                    data: icon,
                    type: guessType(icon)
                };

                function guessType(icon1) {
                    var icon = icon1.toLowerCase();
                    if (icon.indexOf('http') === 0 || icon.indexOf('data:') === 0) {
                        return 'url';
                    } else {
                        return 'css';
                    }
                }
            }

            return {
                addIcons: addIcons,
                getIconForType: getIconForType
            };
        }

        function detailsTemplateConfig() {
            var detailsTemplates = {
                'default': '<div class="ng-spotlight-results-detail-default"><spotlight-result-icon selected-item="selectedItem"></spotlight-result-icon><div class="name">{{selectedItem.name}}</div></div>'
            };

            function addTemplates(templateDescriptors) {
                Object.keys(templateDescriptors)
                    .forEach(function (templateKey) {
                        detailsTemplates[templateKey.toLowerCase()] = templateDescriptors[templateKey];
                    });
            }

            function getTemplateForType(type) {
                return detailsTemplates[(type || 'default').toLowerCase()] || detailsTemplates['default'];
            }

            return {
                addTemplates: addTemplates,
                getTemplateForType: getTemplateForType
            };
        }

        function defaultSpotlightConfig() {
            var KEY_SPACE = 32;
            var searchInputInfoSearching = 'Suchend ...';
            var searchInputInfoNoResults = 'Keine Ergebnisse';
            var spotlightPlaceholder = 'Spotlight-Suche';
            var spotlightToggleCtrlKey = KEY_SPACE;

            function setSearchInputInfoSearching(text) {
                searchInputInfoSearching = text;
            }

            function getSearchInputInfoSearching() {
                return searchInputInfoSearching;
            }

            function setSearchInputInfoNoResults(text) {
                searchInputInfoNoResults = text;
            }

            function getSearchInputInfoNoResults() {
                return searchInputInfoNoResults;
            }

            function setSpotlightPlaceholder(text) {
                spotlightPlaceholder = text;
            }

            function getSpotlightPlaceholder() {
                return spotlightPlaceholder;
            }

            function setSpotlightToggleCtrlKey(key_code) {
                spotlightToggleCtrlKey = key_code;
            }

            function getSpotlightToggleCtrlKey() {
                return spotlightToggleCtrlKey;
            }

            return {
                setSearchInputInfoSearching: setSearchInputInfoSearching,
                getSearchInputInfoSearching: getSearchInputInfoSearching,
                setSearchInputInfoNoResults: setSearchInputInfoNoResults,
                getSearchInputInfoNoResults: getSearchInputInfoNoResults,
                setSpotlightPlaceholder: setSpotlightPlaceholder,
                getSpotlightPlaceholder: getSpotlightPlaceholder,
                setSpotlightToggleCtrlKey: setSpotlightToggleCtrlKey,
                getSpotlightToggleCtrlKey: getSpotlightToggleCtrlKey
            };
        }
    });

