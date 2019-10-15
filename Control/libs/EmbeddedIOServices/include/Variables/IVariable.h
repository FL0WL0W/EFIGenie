#include "Service/IService.h"

#ifndef IVARIABLE_H
#define IVARIABLE_H
namespace Variables
{
    class IVariable : public Service::IService
    {
        protected:
        static Service::ServiceLocator factoryLocator;
        public:
		virtual void TranslateValue() = 0;
		static void Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void BuildCallBack(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);

		static IVariable *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        
        ISERVICE_REGISTERSERVICEFACTORY_H
        static void RegisterCallBackFactory();
    };
}
#endif