#include "EmbeddedIOServiceCollection.h"
#include "Operations/Operation_Package.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace EFIGenie
{
	class EFIGenieMain
	{
		protected:
		OperationArchitecture::IOperationBase *_inputsExecute = 0;
		OperationArchitecture::IOperationBase *_preSyncExecute = 0;
		OperationArchitecture::IOperationBase *_syncCondition = 0;
		OperationArchitecture::IOperationBase *_mainLoopExecute = 0;
		bool _syncedOnce = false;
		OperationArchitecture::OperationFactory *_operationFactory = 0;
		OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *_variableMap;

		public:
		EFIGenieMain(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap);
		~EFIGenieMain();

		void Setup();
		void Loop();
	};
}
#endif