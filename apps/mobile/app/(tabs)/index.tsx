import { StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, View } from 'react-native';
import { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { trpc } from '@/trpc/client';
import { useTodoStore } from '@/stores/todo';

export default function HomeScreen() {
  const [text, setText] = useState('');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#ccc', dark: '#444' }, 'icon');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'icon');
  const isConnected = useNetworkStatus();

  const todos = useTodoStore((state) => state.todos);
  const setTodos = useTodoStore((state) => state.setTodos);
  const create = useTodoStore((state) => state.create);
  const toggle = useTodoStore((state) => state.toggle);
  const deleteTodo = useTodoStore((state) => state.delete);

  const { data } = trpc.todo.list.useQuery();
  const createMutation = trpc.todo.create.useMutation();
  const toggleMutation = trpc.todo.toggle.useMutation();
  const deleteMutation = trpc.todo.delete.useMutation();

  useEffect(() => {
    if (data) {
      setTodos(data);
    }
  }, [data, setTodos]);

  const handleAdd = async () => {
    if (text.trim()) {
      try {
        await create({ text: text.trim() }, createMutation.mutateAsync);
        setText('');
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create todo');
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggle({ id }, toggleMutation.mutateAsync);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to toggle todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo({ id }, deleteMutation.mutateAsync);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete todo');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Todos</ThemedText>
        {isConnected === false && (
          <View style={styles.offlineIcon}>
            <MaterialIcons name="wifi-off" size={20} color="#FF3B30" />
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor, borderColor }]}
          placeholder="Add a todo..."
          placeholderTextColor={placeholderColor}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[styles.addButton, createMutation.isPending && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={createMutation.isPending}
        >
          <ThemedText style={styles.addButtonText}>
            {createMutation.isPending ? 'Adding...' : 'Add'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ThemedView style={styles.todoItem}>
            <TouchableOpacity
              style={styles.todoContent}
              onPress={() => handleToggle(item.id)}
            >
              <ThemedText
                style={[
                  styles.todoText,
                  item.completed && styles.todoTextCompleted,
                ]}
              >
                {item.text}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No todos yet. Add one above!</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 72,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineIcon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  todoContent: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
});
