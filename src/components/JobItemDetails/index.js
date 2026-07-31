import {useState, useEffect, useCallback} from 'react'
import Cookies from 'js-cookie'
import {AiFillStar} from 'react-icons/ai'
import {MdLocationOn} from 'react-icons/md'
import {BsBriefcaseFill} from 'react-icons/bs'
import {FiExternalLink} from 'react-icons/fi'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarJobCard from '../SimilarJobCard'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const getFormattedJobData = data => ({
  companyLogoUrl: data.company_logo_url,
  companyWebsiteUrl: data.company_website_url,
  employmentType: data.employment_type,
  id: data.id,
  jobDescription: data.job_description,
  lifeAtCompany: {
    description: data.life_at_company.description,
    imageUrl: data.life_at_company.image_url,
  },
  location: data.location,
  packagePerAnnum: data.package_per_annum,
  rating: data.rating,
  skills: data.skills.map(skill => ({
    name: skill.name,
    imageUrl: skill.image_url,
  })),
  title: data.title,
})

const getFormattedSimilarJobsData = jobsList =>
  jobsList.map(job => ({
    companyLogoUrl: job.company_logo_url,
    employmentType: job.employment_type,
    id: job.id,
    jobDescription: job.job_description,
    location: job.location,
    packagePerAnnum: job.package_per_annum,
    rating: job.rating,
    title: job.title,
  }))

const JobItemDetails = props => {
  const {match} = props
  const {params} = match
  const {id} = params
  const [jobDetails, setJobDetails] = useState({})
  const [similarJobs, setSimilarJobs] = useState([])
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial)

  const getJobDetails = useCallback(async () => {
    setApiStatus(apiStatusConstants.inProgress)
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok === true) {
      const data = await response.json()
      setJobDetails(getFormattedJobData(data.job_details))
      setSimilarJobs(getFormattedSimilarJobsData(data.similar_jobs))
      setApiStatus(apiStatusConstants.success)
    } else {
      setApiStatus(apiStatusConstants.failure)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    getJobDetails()
  }, [getJobDetails])

  const renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  const renderFailureView = () => (
    <div className="jobs-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-image"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for
      </p>
      <button
        type="button"
        className="jobs-retry-button"
        onClick={getJobDetails}
      >
        Retry
      </button>
    </div>
  )

  const renderJobDetails = () => {
    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      lifeAtCompany,
      location,
      packagePerAnnum,
      rating,
      skills,
      title,
    } = jobDetails

    return (
      <div className="job-item-details-container">
        <div className="job-detail-card">
          <div className="job-card-header">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="company-logo"
            />
            <div>
              <h1 className="job-title">{title}</h1>
              <div className="rating-container">
                <AiFillStar className="star-icon" />
                <p className="rating-text">{rating}</p>
              </div>
            </div>
          </div>
          <div className="job-card-sub-details">
            <div className="location-employment-container">
              <div className="location-container">
                <MdLocationOn className="location-icon" />
                <p className="location-text">{location}</p>
              </div>
              <div className="employment-container">
                <BsBriefcaseFill className="employment-icon" />
                <p className="employment-text">{employmentType}</p>
              </div>
            </div>
            <p className="package-text">{packagePerAnnum}</p>
          </div>
          <hr className="job-separator" />
          <div className="description-heading-container">
            <h1 className="description-heading">Description</h1>
            <a
              href={companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              Visit <FiExternalLink />
            </a>
          </div>
          <p className="job-description">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map(skill => (
              <li className="skill-item" key={skill.name}>
                <img
                  src={skill.imageUrl}
                  alt={skill.name}
                  className="skill-image"
                />
                <p className="skill-name">{skill.name}</p>
              </li>
            ))}
          </ul>
          <h1 className="life-at-company-heading">Life at Company</h1>
          <div className="life-at-company-container">
            <p className="life-at-company-description">
              {lifeAtCompany.description}
            </p>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-at-company-image"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map(job => (
            <SimilarJobCard key={job.id} jobDetails={job} />
          ))}
        </ul>
      </div>
    )
  }

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.success:
        return renderJobDetails()
      case apiStatusConstants.inProgress:
        return renderLoader()
      case apiStatusConstants.failure:
        return renderFailureView()
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="job-item-details-bg">{renderContent()}</div>
    </>
  )
}

export default JobItemDetails
