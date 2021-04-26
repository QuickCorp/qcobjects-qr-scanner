'use strict';
Package('org.qcobjects.services',[
  Class('QCObjectsVersionService',Service,{
      name:'qcobjects_version_service',
      external:true,
      cached:false,
      method:'GET',
      headers:{'Content-Type':'application/json'},
      url:'https://api.github.com/repos/QuickCorp/QCObjects/tags',
      withCredentials:false,
      _new_:()=>{
        // service instantiated
      },
      done:({request, service})=>{
        var latest = JSON.parse(service.template)[0];
        service.template = {
          version: latest.name
        };
      }
  }),
  Class('QCObjectsStarsForksService',Service,{
      name:'qcobjects_stars_forks_service',
      external:true,
      cached:false,
      method:'GET',
      headers:{'Content-Type':'application/json'},
      url:'https://api.github.com/repos/QuickCorp/QCObjects',
      withCredentials:false,
      _new_:()=>{
        // service instantiated
      },
      done:({request, service})=>{
        var repo = JSON.parse(service.template);
        service.template = {
          forks: repo.forks_count,
          stars: repo.stargazers_count,
          watchers: repo.watchers_count,
          size: Math.round(repo.size/1000)
        };
      }
  }),
  Class('NPMDownloadsService',Service,{
      name:'qcobjects_npm_service',
      external:true,
      cached:false,
      method:'GET',
      headers:{'Content-Type':'application/json', 'Accept': 'application/vnd.npm.install-v1+json'},
      url:"https://us-central1-qcobjects-functions.cloudfunctions.net/npm-downloads",
      withCredentials:false,
      _new_ (o) {
        // service instantiated
      },
      done:({request, service})=>{
        var serviceResponse = JSON.parse(service.template);
        service.template = {
          startDate: (new Date(serviceResponse.startDate)).toString(),
          endDate: (new Date(serviceResponse.endDate)).toString(),
          downloads: serviceResponse.downloads.toString()
        }
      }
  })
]);
