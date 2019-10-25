#include "Service/IService.h"
#define BUILDER_VARIABLE 7001

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

		static IVariable *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        template<typename RET>
        static RET * GetOrCreateVariable(Service::ServiceLocator * const &serviceLocator, const uint32_t variableId)
        {
			RET *variable = serviceLocator->LocateAndCast<RET>(BUILDER_VARIABLE, variableId);
			if(variable == 0)
			{
				variable = (RET *)calloc(1, sizeof(RET));
				serviceLocator->Register(BUILDER_VARIABLE, variableId, variable);
			}

            return variable;
        }
        
        ISERVICE_REGISTERSERVICEFACTORY_H
    };
}
#endif