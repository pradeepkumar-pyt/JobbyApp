import {useState, useEffect, useCallback} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import JobCard from '../JobCard'
import './index.css'

const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

const salaryRangesList = [
  {salaryRangeId: '1000000', label: '10 LPA and above'},
  {salaryRangeId: '2000000', label: '20 LPA and above'},
  {salaryRangeId: '3000000', label: '30 LPA and above'},
  {salaryRangeId: '4000000', label: '40 LPA and above'},
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const Jobs = () => {
  const [profileData, setProfileData] = useState({})
  const [profileApiStatus, setProfileApiStatus] = useState(
    apiStatusConstants.initial,
  )

  const [jobsList, setJobsList] = useState([])
  const [jobsApiStatus, setJobsApiStatus] = useState(apiStatusConstants.initial)

  const [employmentType, setEmploymentType] = useState([])
  const [minimumPackage, setMinimumPackage] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeSearchInput, setActiveSearchInput] = useState('')

  const getProfileDetails = useCallback(async () => {
    setProfileApiStatus(apiStatusConstants.inProgress)
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedData = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      setProfileData(updatedData)
      setProfileApiStatus(apiStatusConstants.success)
    } else {
      setProfileApiStatus(apiStatusConstants.failure)
    }
  }, [])

  const getJobsList = useCallback(async () => {
    setJobsApiStatus(apiStatusConstants.inProgress)
    const jwtToken = Cookies.get('jwt_token')
    const employmentTypeParam = employmentType.join(',')
    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentTypeParam}&minimum_package=${minimumPackage}&search=${activeSearchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok === true) {
      const data = await response.json()
      const updatedJobsList = data.jobs.map(job => ({
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        id: job.id,
        jobDescription: job.job_description,
        location: job.location,
        packagePerAnnum: job.package_per_annum,
        rating: job.rating,
        title: job.title,
      }))
      setJobsList(updatedJobsList)
      setJobsApiStatus(apiStatusConstants.success)
    } else {
      setJobsApiStatus(apiStatusConstants.failure)
    }
  }, [employmentType, minimumPackage, activeSearchInput])

  useEffect(() => {
    getProfileDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getJobsList()
  }, [getJobsList])

  const onChangeSearchInput = event => {
    setSearchInput(event.target.value)
  }

  const onClickSearch = () => {
    setActiveSearchInput(searchInput)
  }

  const onKeyDownSearch = event => {
    if (event.key === 'Enter') {
      setActiveSearchInput(searchInput)
    }
  }

  const onChangeEmploymentType = event => {
    const {value, checked} = event.target
    if (checked) {
      setEmploymentType(prevState => [...prevState, value])
    } else {
      setEmploymentType(prevState => prevState.filter(each => each !== value))
    }
  }

  const onChangeSalaryRange = event => {
    setMinimumPackage(event.target.value)
  }

  const renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  const renderProfile = () => {
    switch (profileApiStatus) {
      case apiStatusConstants.success:
        return (
          <div className="profile-container">
            <img
              src={profileData.profileImageUrl}
              alt="profile"
              className="profile-image"
            />
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-bio">{profileData.shortBio}</p>
          </div>
        )
      case apiStatusConstants.inProgress:
        return renderLoader()
      case apiStatusConstants.failure:
        return (
          <div className="profile-failure-container">
            <button
              type="button"
              className="profile-retry-button"
              onClick={getProfileDetails}
            >
              Retry
            </button>
          </div>
        )
      default:
        return null
    }
  }

  const renderJobsList = () => {
    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-image"
          />
          <h1 className="no-jobs-heading">No Jobs Found</h1>
          <p className="no-jobs-description">
            We could not find any jobs. Try other filters
          </p>
        </div>
      )
    }
    return (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <JobCard key={job.id} jobDetails={job} />
        ))}
      </ul>
    )
  }

  const renderJobsFailureView = () => (
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
      <button type="button" className="jobs-retry-button" onClick={getJobsList}>
        Retry
      </button>
    </div>
  )

  const renderJobsSection = () => {
    switch (jobsApiStatus) {
      case apiStatusConstants.success:
        return renderJobsList()
      case apiStatusConstants.inProgress:
        return renderLoader()
      case apiStatusConstants.failure:
        return renderJobsFailureView()
      default:
        return null
    }
  }

  return (
    <>
      <Header />
      <div className="jobs-bg-container">
        <div className="filters-section">
          {renderProfile()}
          <hr className="separator" />
          <div className="filter-group">
            <h1 className="filter-heading">Type of Employment</h1>
            <ul className="filter-list">
              {employmentTypesList.map(each => (
                <li className="filter-item" key={each.employmentTypeId}>
                  <input
                    type="checkbox"
                    id={each.employmentTypeId}
                    value={each.employmentTypeId}
                    onChange={onChangeEmploymentType}
                    className="checkbox-input"
                  />
                  <label
                    htmlFor={each.employmentTypeId}
                    className="filter-label"
                  >
                    {each.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <hr className="separator" />
          <div className="filter-group">
            <h1 className="filter-heading">Salary Range</h1>
            <ul className="filter-list">
              {salaryRangesList.map(each => (
                <li className="filter-item" key={each.salaryRangeId}>
                  <input
                    type="radio"
                    id={each.salaryRangeId}
                    name="salaryRange"
                    value={each.salaryRangeId}
                    onChange={onChangeSalaryRange}
                    className="radio-input"
                  />
                  <label htmlFor={each.salaryRangeId} className="filter-label">
                    {each.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="jobs-section">
          <div className="search-container">
            <input
              type="search"
              placeholder="Search"
              className="search-input"
              value={searchInput}
              onChange={onChangeSearchInput}
              onKeyDown={onKeyDownSearch}
            />
            <button
              type="button"
              data-testid="searchButton"
              className="search-button"
              onClick={onClickSearch}
            >
              <BsSearch className="search-icon" />
            </button>
          </div>
          {renderJobsSection()}
        </div>
      </div>
    </>
  )
}

export default Jobs
