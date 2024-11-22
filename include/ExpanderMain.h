#include "EmbeddedIOServiceCollection.h"
#include "Operations/Operation_Package.h"

#ifndef EXPANDERMAIN_H
#define EXPANDERMAIN_H
namespace EFIGenie
{
	class ExpanderMain
	{
		protected:
		OperationArchitecture::AbstractOperation *_mainLoopExecute = 0;
		OperationArchitecture::OperationFactory *_operationFactory = 0;
		OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *_variableMap;

		public:
		ExpanderMain(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap);
		~ExpanderMain();

		void Setup();
		void Loop();
	};
}
#endif