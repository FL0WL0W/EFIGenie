#include "EmbeddedIOServiceCollection.h"
#include "Operations/Operation_Package.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace EFIGenie
{
	class EFIGenieMain
	{
		protected:
		OperationArchitecture::IOperationBase *_inputsExecute;
		OperationArchitecture::IOperationBase *_preSyncExecute;
		OperationArchitecture::IOperationBase *_syncCondition;
		OperationArchitecture::IOperationBase *_mainLoopExecute;
		bool _syncedOnce = false;
		OperationArchitecture::OperationFactory *_operationFactory;
		OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *_variableMap;

		public:
		EFIGenieMain(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap);
		~EFIGenieMain();

		void Setup();
		void Loop();
	};
}
#endif