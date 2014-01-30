# HP Metrics

Metrics for HP partners

## Getting Started

Download the [production version][min] or the [development version][max].

[min]: https://github.com/colevoss/hp_metrics/blob/master/dist/scripts/hp-metrics.min.js
[max]: https://github.com/colevoss/hp_metrics/blob/master/dist/scripts/hp-metrics.js

###In your web page:
After including jquery and hp-metrics.[min.]js place "_$.hpMetrics()_" inside a document.ready function somehwere in your javascripts.

Then add a hp-metrics data attribute to the button or link that will initialize HP Metrics modal whose value is a json representation of a vehicle.
```html
<script src="jquery.js"></script>
<script src="dist/hp-metrics.min.js"></script>
<script>
  $(function(){
    $.hpMetrics();
  });
</script>
<button data-hp-metrics='{"year": "2014", "make": "Cadillac", "model": "ATS"}'></button>
```
This should prepare the button to display the HP Metrics modal when clicked.

## Documentation
### Customization
You can determin how the HP Metrics modal enters the screen by setting parameters such as:
_*defaults in bold italics_
* entrace: [slide, _**fade**_]
* startPlacement: [_**top**_, left, right, bottom]
* speed: [_**fast**_, slow, 100-1000]
```javascript
  $(function(){
    $.hpMetrics({
      entrance: 'slide', // Modal slides into view
      startPlacement: 'left', // Modal slides from the left side of the screen.
      speed: 500 // Medium speed.
    })
  });
```

#### How It Works
When the button with the hp-metrics data attribute is clicked, the HP Metrics modal will appear asking for the user to type in a zipcode if it is between the hours of 8 A.M. and 5 P.M. MST. Once a valid zipcode is supplied, the user will be directed to the [SureHits website][surehits]. If it is not between the hours of 8 A.M. and 5 P.M. MST, the user will be immediate directed to [Flexquote website][flexquote].

[surehits]: https://www.surehits.com/
[flexquote]: http://www.flexquote.com/auto-insurance
