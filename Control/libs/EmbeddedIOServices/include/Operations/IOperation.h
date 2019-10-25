#include "Service/IService.h"
#define BUILDER_OPERATION 6001

#define IOPERATION_REGISTERFACTORY_CPP(cl, id, ...)    				            \
void cl::RegisterFactory()                                         				\
{                                                           					\
    if(factoryLocator.Locate(id) == 0)                                       	\
        factoryLocator.Register(id, reinterpret_cast<void *>(Create));			\
    Variables::Variable_Operation<__VA_ARGS__>::RegisterFactory(id);            \
}     

#ifndef IOPERATION_H
#define IOPERATION_H
namespace Operations
{
    class IOperationBase : public Service::IService
    {
        protected:
        static Service::ServiceLocator factoryLocator;
        public:
		static void Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        
        ISERVICE_REGISTERSERVICEFACTORY_H
    };

    template<typename RET, typename... PARAMS>
    class IOperation : public IOperationBase
    {
        public:
        virtual RET Execute(PARAMS...) = 0;
    };
}
#endif