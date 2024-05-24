document.addEventListener('DOMContentLoaded', function () {
    InitializeTestimonials(-1);
});

var testimonials = [];

function InitializeTestimonials(id) {
    var carouselIndicators = document.getElementById('carouselIndicators');
    var carouselInner = document.getElementById('carouselInner');

    fetch('/testimonials')
        .then(response => response.json())
        .then(testimonialsFetched => {
            testimonials = testimonialsFetched;
            testimonials.forEach(function (item, index) {
                var indicatorButton = document.createElement('button');
                indicatorButton.type = 'button';
                indicatorButton.setAttribute('data-bs-target', '#myCarousel');
                indicatorButton.setAttribute('data-bs-slide-to', index.toString());
                indicatorButton.setAttribute('aria-label', 'Slide ' + (index + 1));
                if (index === 0) {
                    indicatorButton.className = 'active';
                }
                carouselIndicators.appendChild(indicatorButton);

                var carouselItem = document.createElement('div');
                carouselItem.className = 'carousel-item opacity-80' + (index === 0 ? ' active' : '');
                var innerHtmlTestimonial = `
                    <div class="carousel-card text-left">
                        <h4 class="text-light custom-bold-sub p-0 m-0">${item.name}</h4>
                        <div class="row d-inline px-0 mx-0 my-3">
                            <h6 class="text-light custom-light-sub d-inline mx-0 px-0">${item.destinationName} • </h6>
                            <div class="d-inline mx-0 px-0">
                    `;
                for (var i = 0; i < item.rating; i++) {
                    innerHtmlTestimonial += `<img src="/assets/star.svg" alt="Star" class="star-icon mx-0 px-0" />`;
                }
                innerHtmlTestimonial += `
                    </div>
                        </div>
                            <h6 class="text-light custom-light-sub px-0 mx-0 my-3">${item.review}</h6>
                        </div>
                    `;
                carouselItem.innerHTML = innerHtmlTestimonial;
                carouselInner.appendChild(carouselItem);
            });
            loadTestimonials();
        })
        .catch(error => {
            console.error('Error fetching testimonials:', error);
        });
}

function loadTestimonials() {
    const testimonialsList = document.getElementById('testimonialsList');
    testimonialsList.innerHTML = '';
    testimonials.forEach(function (testimonial, index) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
                <div>
                    <h5>${testimonial.name}</h5>
                    <p>Destination: ${testimonial.destinationName}</p>
                    <p>Rating: ${testimonial.rating}</p>
                    <p>Review: ${testimonial.review}</p>
                    <button class="btn btn-primary btn-sm" onclick="editTestimonial('${index}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTestimonial(${testimonial.id})">Delete</button>
                </div>
                `;
        testimonialsList.appendChild(li);
    });
}

function saveTestimonial(Id) {

    const testimonialData = {
        Id: Id,
        Name: document.getElementById('testimonialName').value,
        DestinationName: document.getElementById('testimonialDestination').value,
        Rating: parseInt(document.getElementById('testimonialRating').value),
        Review: document.getElementById('testimonialReview').value
    }
    fetch(`/testimonials/${Id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testimonialData)
    })
        .then(() => {
            InitializeTestimonials();
            $('#testimonialModal').modal('hide');
        })
        .catch(error => {
            console.error('Error updating testimonial:', error);
        });
}

function editTestimonial(index) {
    var testimonial = testimonials[index];
    document.getElementById('testimonialName').value = testimonial.name;
    document.getElementById('testimonialDestination').value = testimonial.destinationName;
    document.getElementById('testimonialRating').value = testimonial.rating;
    document.getElementById('testimonialReview').value = testimonial.review;

    $('#testimonialModal').modal('show');

    document.getElementById('saveTestimonialBtn').onclick = function () {
        saveTestimonial(parseInt(testimonial.id));
    };
}

function addTestimonial() {

    document.getElementById('testimonialName').value = "";
    document.getElementById('testimonialDestination').value = "";
    document.getElementById('testimonialRating').value = "";
    document.getElementById('testimonialReview').value = "";

    $('#testimonialModal').modal('show');

    document.getElementById('saveTestimonialBtn').onclick = function () {
        saveAddedTestimonial();
    };
}

function deleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        fetch(`/testimonials/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    loadTestimonials();
                } else {
                    console.error('Error deleting testimonial:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting testimonial:', error);
            });
    }
}

function saveAddedTestimonial() {
    const testimonialData = {
        name: document.getElementById('testimonialName').value,
        destinationName: document.getElementById('testimonialDestination').value,
        rating: document.getElementById('testimonialRating').value,
        review: document.getElementById('testimonialReview').value
    };

    fetch('/testimonials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testimonialData)
    })
        .then(response => {
            if (response.ok) {
                loadTestimonials();
                $('#testimonialModal').modal('hide');
            } else {
                console.error('Error saving testimonial:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error saving testimonial:', error);
        });
}