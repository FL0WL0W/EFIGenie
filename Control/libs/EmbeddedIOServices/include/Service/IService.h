#include "Service/ServiceLocator.h"

#define ISERVICE_REGISTERFACTORY_H                        					    \
static void RegisterFactory();                                     				

#define ISERVICE_REGISTERFACTORY_H_TEMPLATE(func)          					    \
static void RegisterFactory(uint16_t id)                                        \
{                                                           					\
    if(factoryLocator.Locate(id) == 0)                                       	\
        factoryLocator.Register(id, reinterpret_cast<void *>(func));			\
}                                                                               

#define ISERVICE_REGISTERFACTORY_CPP(cl, func, id)         					    \
void cl::RegisterFactory()                                         				\
{                                                           					\
    if(factoryLocator.Locate(id) == 0)                                       	\
        factoryLocator.Register(id, reinterpret_cast<void *>(func));			\
}                                                           					

#define ISERVICE_REGISTERSERVICEFACTORY_H                        				\
static void RegisterServiceFactory();                               			\

#define ISERVICE_REGISTERSERVICEFACTORY_CPP(cl, func, id)              			\
void cl::RegisterServiceFactory()                                   			\
{                                                           					\
    if(serviceFactoryLocator.Locate(id) == 0)                                  	\
        serviceFactoryLocator.Register(id, reinterpret_cast<void *>(func));		\
}

#ifndef ISERVICE_H
#define ISERVICE_H

namespace Service
{
    class IService
    {
        protected:
        static Service::ServiceLocator serviceFactoryLocator;
        public:
		static void Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void OffsetConfig(const void *&config, unsigned int &totalSize, unsigned int offset);
		
		template<typename T>
		static const T* CastConfigAndOffset(const void *&config, unsigned int &size)
		{
			const T *castedConfig = reinterpret_cast<const T *>(config);
			OffsetConfig(config, size, castedConfig->Size());
			
			return castedConfig;
		}
		
		template<typename T>
		static const T CastAndOffset(const void *&config, unsigned int &size)
		{
			const T casted = *reinterpret_cast<const T *>(config);
			OffsetConfig(config, size, sizeof(T));
			
			return casted;
		}

		static void CreateServiceAndOffset(void(*builder)(ServiceLocator * const &, const void *, unsigned int &), ServiceLocator * const &serviceLocator, const void *&config, unsigned int &totalSize);
    };
}

#endif